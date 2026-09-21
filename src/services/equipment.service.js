import { v4 as uuidv4 } from "uuid";
import { equipmentRepository } from "../repositories/equipment.repository.js";
import { requestRepository } from "../repositories/request.repository.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { ConflictError } from "../errors/ConflictError.js";
import { ValidationError } from "../errors/ValidationError.js";

export class EquipmentService {
  /**
   * Получение списка оборудования с фильтрацией, сортировкой и пагинацией
   */
  async getAll(query) {
    let items = await equipmentRepository.findAll();

    // Фильтрация
    if (query.status) {
      items = items.filter((item) => item.status === query.status);
    }
    if (query.type) {
      items = items.filter((item) => item.type === query.type);
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
    const equipment = await equipmentRepository.findById(id);
    if (!equipment) {
      throw new NotFoundError(`Оборудование с id ${id} не найдено`);
    }
    return equipment;
  }

  async create(data) {
    // Проверка уникальности серийного номера
    const existing = await equipmentRepository.findBySerialNumber(
      data.serialNumber,
    );
    if (existing) {
      throw new ConflictError(
        `Оборудование с серийным номером ${data.serialNumber} уже существует`,
      );
    }

    const now = new Date().toISOString();
    const newEquipment = {
      id: uuidv4(),
      name: data.name,
      type: data.type,
      serialNumber: data.serialNumber,
      location: data.location,
      status: data.status || "operational",
      installedAt: data.installedAt,
      createdAt: now,
      updatedAt: now,
    };

    return equipmentRepository.create(newEquipment);
  }

  async update(id, data) {
    const equipment = await this.getById(id);

    // Если меняется serialNumber - проверяю уникальность
    if (data.serialNumber && data.serialNumber !== equipment.serialNumber) {
      const existing = await equipmentRepository.findBySerialNumber(
        data.serialNumber,
      );
      if (existing) {
        throw new ConflictError(
          `Оборудование с серийным номером ${data.serialNumber} уже существует`,
        );
      }
    }

    // Запрещаю менять id и createdAt
    delete data.id;
    delete data.createdAt;

    data.updatedAt = new Date().toISOString();

    return equipmentRepository.update(id, data);
  }

  async delete(id) {
    await this.getById(id);

    // Проверка наличия открытых заявок
    const openRequests = await requestRepository.findOpenByEquipmentId(id);
    if (openRequests.length > 0) {
      throw new ConflictError(
        `Невозможно удалить оборудование: по нему есть ${openRequests.length} открытых заявок`,
      );
    }

    return equipmentRepository.delete(id);
  }

  async getRequestsByEquipmentId(id) {
    await this.getById(id);
    return requestRepository.findByEquipmentId(id);
  }
}

export const equipmentService = new EquipmentService();
