import { v4 as uuidv4 } from "uuid";
import { equipmentRepository } from "../repositories/equipment.repository.js";
import { requestRepository } from "../repositories/request.repository.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { ConflictError } from "../errors/ConflictError.js";

// Белый список сортировки (защита от SQL-инъекций в ORDER BY)
const SORT_FIELD_MAP = {
  name: "name",
  serialNumber: "serial_number",
  status: "status",
  installedAt: "installed_at",
  createdAt: "created_at",
};

const DEFAULT_SITE_ID = "11111111-1111-1111-1111-111111111111";

export class EquipmentService {
  _buildWhere(query) {
    const where = {};
    if (query.status) where.status = query.status;
    if (query.type) where.type = query.type;
    if (query.siteId) where.site_id = query.siteId;
    if (query.serialNumber) where.serial_number = query.serialNumber;
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

    const { rows, count } = await equipmentRepository.findAndCountAll({
      where: this._buildWhere(query),
      order: this._buildOrder(query),
      limit,
      offset,
      include: [
        { association: "passport", required: false },
        { association: "site", required: false },
      ],
    });

    return {
      data: rows,
      meta: { total: count, page, limit },
    };
  }

  async getById(id) {
    const equipment = await equipmentRepository.findById(id, {
      include: [
        { association: "passport", required: false },
        { association: "site", required: false },
      ],
    });
    if (!equipment) {
      throw new NotFoundError(`Оборудование с id ${id} не найдено`);
    }
    return equipment;
  }

  async create(data) {
    const existing = await equipmentRepository.findBySerialNumber(
      data.serialNumber,
    );
    if (existing) {
      throw new ConflictError(
        `Оборудование с серийным номером ${data.serialNumber} уже существует`,
      );
    }

    const entity = {
      id: uuidv4(),
      site_id: data.siteId || DEFAULT_SITE_ID, // обратная совместимость с Кейсом 2
      name: data.name,
      type: data.type,
      serial_number: data.serialNumber,
      latitude: data.location?.lat ?? data.latitude,
      longitude: data.location?.lon ?? data.longitude,
      status: data.status || "operational",
      installed_at: data.installedAt,
    };

    return equipmentRepository.create(entity);
  }

  async update(id, data) {
    await this.getById(id);

    const updates = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.type !== undefined) updates.type = data.type;
    if (data.status !== undefined) updates.status = data.status;
    if (data.siteId !== undefined) updates.site_id = data.siteId;
    if (data.installedAt !== undefined) updates.installed_at = data.installedAt;
    if (data.location) {
      if (data.location.lat !== undefined) updates.latitude = data.location.lat;
      if (data.location.lon !== undefined)
        updates.longitude = data.location.lon;
    }
    if (data.serialNumber) {
      const existing = await equipmentRepository.findBySerialNumber(
        data.serialNumber,
      );
      if (existing && existing.id !== id) {
        throw new ConflictError(
          `Оборудование с серийным номером ${data.serialNumber} уже существует`,
        );
      }
      updates.serial_number = data.serialNumber;
    }

    return equipmentRepository.update(id, updates);
  }

  async delete(id) {
    await this.getById(id);

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
