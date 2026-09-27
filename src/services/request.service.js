import { v4 as uuidv4 } from "uuid";
import { requestRepository } from "../repositories/request.repository.js";
import { equipmentRepository } from "../repositories/equipment.repository.js";
import { sequelize } from "../config/database.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { ConflictError } from "../errors/ConflictError.js";
import { ValidationError } from "../errors/ValidationError.js";

// Допустимые переходы статусов заявки
const STATUS_TRANSITIONS = {
  new: ["in_progress", "rejected"],
  in_progress: ["done", "rejected"],
  done: [],
  rejected: [],
};

// Белый список сортировки (защита от SQL-инъекций)
const SORT_FIELD_MAP = {
  title: "title",
  priority: "priority",
  status: "status",
  createdAt: "created_at",
  plannedAt: "planned_at",
};

export class RequestService {
  _buildWhere(query) {
    const where = {};
    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;
    if (query.equipmentId) where.equipment_id = query.equipmentId;

    if (query.dateFrom || query.dateTo) {
      where.created_at = {};
      if (query.dateFrom) where.created_at[">="] = new Date(query.dateFrom);
      if (query.dateTo) where.created_at["<="] = new Date(query.dateTo);
    }
    return where;
  }

  _buildOrder(query) {
    const field = SORT_FIELD_MAP[query.sortBy];
    if (!field) return [["created_at", "DESC"]];
    const dir = query.sortOrder === "desc" ? "DESC" : "ASC";
    return [[field, dir]];
  }

  async getAll(query) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
    const offset = (page - 1) * limit;

    const { rows, count } = await requestRepository.findAndCountAll({
      where: this._buildWhere(query),
      order: this._buildOrder(query),
      limit,
      offset,
      include: [
        { association: "equipment", required: false },
        {
          association: "assignees",
          required: false,
          through: { attributes: ["role", "hours"] },
        },
      ],
    });

    return { data: rows, meta: { total: count, page, limit } };
  }

  async getById(id) {
    const request = await requestRepository.findById(id, {
      include: [
        { association: "equipment", required: false },
        {
          association: "assignees",
          required: false,
          through: { attributes: ["role", "hours"] },
        },
        { association: "history", required: false },
      ],
    });
    if (!request) {
      throw new NotFoundError(`Заявка с id ${id} не найдена`);
    }
    return request;
  }

  async create(data) {
    const equipment = await equipmentRepository.findById(data.equipmentId);
    if (!equipment) {
      throw new NotFoundError(
        `Оборудование с id ${data.equipmentId} не найдено`,
      );
    }

    const entity = {
      id: uuidv4(),
      equipment_id: data.equipmentId,
      title: data.title,
      description: data.description || null,
      priority: data.priority,
      status: "new",
      planned_at: data.plannedAt || null,
      created_by: data.createdBy || null,
    };

    const created = await requestRepository.create(entity);

    // Журналируем создание заявки
    await sequelize.models.RequestStatusHistory.create({
      id: uuidv4(),
      request_id: created.id,
      old_status: null,
      new_status: "new",
      changed_by: "system",
      comment: "Заявка создана",
    });

    return created;
  }

  async update(id, data) {
    await this.getById(id);

    const updates = {};
    if (data.title !== undefined) updates.title = data.title;
    if (data.description !== undefined) updates.description = data.description;
    if (data.priority !== undefined) updates.priority = data.priority;
    if (data.plannedAt !== undefined) updates.planned_at = data.plannedAt;

    return requestRepository.update(id, updates);
  }

  /**
   * Смена статуса в транзакции: обновление + запись в историю.
   */
  async updateStatus(id, newStatus) {
    const request = await this.getById(id);

    const allowed = STATUS_TRANSITIONS[request.status] || [];
    if (!allowed.includes(newStatus)) {
      throw new ConflictError(
        `Недопустимый переход статуса: ${request.status} → ${newStatus}`,
      );
    }

    // Требование: in_progress нельзя без назначенных исполнителей
    if (newStatus === "in_progress") {
      const assignments = await sequelize.models.RequestAssignee.findAll({
        where: { request_id: id },
      });
      if (assignments.length === 0) {
        throw new ConflictError(
          "Нельзя перевести заявку в in_progress без назначенных исполнителей",
        );
      }
    }

    // Транзакция: обновление + запись в историю
    return sequelize.transaction(async (t) => {
      await requestRepository.update(
        id,
        { status: newStatus },
        { transaction: t },
      );

      await sequelize.models.RequestStatusHistory.create(
        {
          id: uuidv4(),
          request_id: id,
          old_status: request.status,
          new_status: newStatus,
          changed_by: "system",
          comment: `Смена статуса: ${request.status} → ${newStatus}`,
        },
        { transaction: t },
      );

      return requestRepository.findById(id, { transaction: t });
    });
  }

  /**
   * Удаление заявки вместе с историей и назначениями (в транзакции).
   */
  async delete(id) {
    await this.getById(id);

    return sequelize.transaction(async (t) => {
      await sequelize.models.RequestStatusHistory.destroy({
        where: { request_id: id },
        transaction: t,
      });
      await sequelize.models.RequestAssignee.destroy({
        where: { request_id: id },
        transaction: t,
      });
      await requestRepository.delete(id, { transaction: t });
    });
  }

  /**
   * История изменения статусов заявки.
   */
  async getHistory(id) {
    await this.getById(id);

    const history = await sequelize.models.RequestStatusHistory.findAll({
      where: { request_id: id },
      order: [["changed_at", "ASC"]],
    });

    return history.map((h) => {
      const plain = h.get({ plain: true });
      return {
        id: plain.id,
        requestId: plain.request_id,
        oldStatus: plain.old_status,
        newStatus: plain.new_status,
        changedBy: plain.changed_by,
        comment: plain.comment,
        changedAt: plain.changed_at,
      };
    });
  }

  /**
   * Назначение бригады в транзакции: снять старые + добавить новые.
   * Требование: ровно один специалист с ролью lead.
   */
  async assignTeam(requestId, assignees) {
    await this.getById(requestId);

    // Валидация: ровно один lead
    const leads = assignees.filter((a) => a.role === "lead");
    if (leads.length !== 1) {
      throw new ValidationError(
        "В бригаде должен быть ровно один специалист с ролью lead",
        [
          {
            field: "assignees",
            message: `Найдено lead: ${leads.length}, ожидается 1`,
          },
        ],
      );
    }

    // Проверка, что все специалисты существуют
    const technicianIds = assignees.map((a) => a.technicianId);
    const found = await sequelize.models.Technician.findAll({
      where: { id: technicianIds },
    });
    if (found.length !== technicianIds.length) {
      const foundIds = found.map((t) => t.id);
      const missing = technicianIds.filter((id) => !foundIds.includes(id));
      throw new NotFoundError(`Специалисты не найдены: ${missing.join(", ")}`);
    }

    // Транзакция: удалить старые + создать новые
    return sequelize.transaction(async (t) => {
      await sequelize.models.RequestAssignee.destroy({
        where: { request_id: requestId },
        transaction: t,
      });

      const rows = assignees.map((a) => ({
        id: uuidv4(),
        request_id: requestId,
        technician_id: a.technicianId,
        role: a.role,
        hours: a.hours,
      }));

      await sequelize.models.RequestAssignee.bulkCreate(rows, {
        transaction: t,
      });

      return requestRepository.findById(requestId, {
        transaction: t,
        include: [
          {
            association: "assignees",
            through: { attributes: ["role", "hours"] },
          },
        ],
      });
    });
  }

  /**
   * Снятие специалиста с заявки.
   */
  async removeAssignee(requestId, technicianId) {
    await this.getById(requestId);

    const deletedCount = await sequelize.models.RequestAssignee.destroy({
      where: { request_id: requestId, technician_id: technicianId },
    });

    if (deletedCount === 0) {
      throw new NotFoundError(
        `Специалист ${technicianId} не назначен на заявку ${requestId}`,
      );
    }
  }
}

export const requestService = new RequestService();
