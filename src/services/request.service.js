import { v4 as uuidv4 } from "uuid";
import { requestRepository } from "../repositories/request.repository.js";
import { equipmentRepository } from "../repositories/equipment.repository.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { ConflictError } from "../errors/ConflictError.js";

// Допустимые переходы статусов
const STATUS_TRANSITIONS = {
  new: ["in_progress", "rejected"],
  in_progress: ["done", "rejected"],
  done: [],
  rejected: [],
};

export class RequestService {
  async getAll(query) {
    let items = await requestRepository.findAll();

    // Фильтрация
    if (query.status) {
      items = items.filter((item) => item.status === query.status);
    }
    if (query.priority) {
      items = items.filter((item) => item.priority === query.priority);
    }
    if (query.equipmentId) {
      items = items.filter((item) => item.equipmentId === query.equipmentId);
    }
    if (query.dateFrom) {
      const from = new Date(query.dateFrom).getTime();
      items = items.filter(
        (item) => new Date(item.createdAt).getTime() >= from,
      );
    }
    if (query.dateTo) {
      const to = new Date(query.dateTo).getTime();
      items = items.filter((item) => new Date(item.createdAt).getTime() <= to);
    }

    // Сортировка
    if (query.sortBy) {
      const order = query.sortOrder === "desc" ? -1 : 1;
      items.sort((a, b) => {
        if (a[query.sortBy] < b[query.sortBy]) return -1 * order;
        if (a[query.sortBy] > b[query.sortBy]) return 1 * order;
        return 0;
      });
    }

    // Пагинация
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const total = items.length;
    const startIndex = (page - 1) * limit;
    const paginatedItems = items.slice(startIndex, startIndex + limit);

    return {
      data: paginatedItems,
      meta: { total, page, limit },
    };
  }

  async getById(id) {
    const request = await requestRepository.findById(id);
    if (!request) {
      throw new NotFoundError(`Заявка с id ${id} не найдена`);
    }
    return request;
  }

  async create(data) {
    // Проверяю, что оборудование существует
    const equipment = await equipmentRepository.findById(data.equipmentId);
    if (!equipment) {
      throw new NotFoundError(
        `Оборудование с id ${data.equipmentId} не найдено`,
      );
    }

    const now = new Date().toISOString();
    const newRequest = {
      id: uuidv4(),
      equipmentId: data.equipmentId,
      title: data.title,
      description: data.description || "",
      priority: data.priority,
      status: "new", // По умолчанию
      plannedAt: data.plannedAt || null,
      createdAt: now,
      updatedAt: now,
    };

    return requestRepository.create(newRequest);
  }

  async update(id, data) {
    await this.getById(id);

    // Запрещаю менять id, equipmentId, status, createdAt
    delete data.id;
    delete data.equipmentId;
    delete data.status;
    delete data.createdAt;

    data.updatedAt = new Date().toISOString();

    return requestRepository.update(id, data);
  }

  async updateStatus(id, newStatus) {
    const request = await this.getById(id);

    const allowedTransitions = STATUS_TRANSITIONS[request.status] || [];
    if (!allowedTransitions.includes(newStatus)) {
      throw new ConflictError(
        `Недопустимый переход статуса: ${request.status} → ${newStatus}`,
      );
    }

    return requestRepository.update(id, {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });
  }

  async delete(id) {
    await this.getById(id);
    return requestRepository.delete(id);
  }
}

export const requestService = new RequestService();
