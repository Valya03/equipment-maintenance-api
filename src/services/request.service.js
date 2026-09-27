import { v4 as uuidv4 } from "uuid";
import { requestRepository } from "../repositories/request.repository.js";
import { equipmentRepository } from "../repositories/equipment.repository.js";
import { RequestStatusHistory } from "../models/request-status-history.model.js";
import { sequelize } from "../config/database.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { ConflictError } from "../errors/ConflictError.js";
import { ValidationError } from "../errors/ValidationError.js";

// Таблица допустимых переходов статусов
const STATUS_TRANSITIONS = {
  new: ["in_progress", "rejected"],
  in_progress: ["done", "rejected"],
  done: [],
  rejected: [],
};

// Белый список сортировки
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

    // Журналируем создание
    await RequestStatusHistory.create({
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

    // Требование: in_progress нельзя без исполнителей
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

    // Транзакция: обновление + история
    const result = await sequelize.transaction(async (t) => {
      await requestRepository.update(
        id,
        { status: newStatus },
        { transaction: t },
      );

      await RequestStatusHistory.create(
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

    return result;
  }

  async delete(id) {
    await this.getById(id);
    return requestRepository.delete(id);
  }
}

export const requestService = new RequestService();
