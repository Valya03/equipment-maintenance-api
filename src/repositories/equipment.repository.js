import { Equipment } from "../models/equipment.model.js";
import { BaseRepository } from "./base.repository.js";

export class EquipmentRepository extends BaseRepository {
  constructor() {
    super(Equipment);
  }

  /**
   * Преобразование БД-модели в формат API Кейса 2 (camelCase + location).
   */
  _toApiFormat(instance) {
    if (!instance) return null;
    const plain = instance.get({ plain: true });
    return {
      id: plain.id,
      siteId: plain.site_id,
      name: plain.name,
      type: plain.type,
      serialNumber: plain.serial_number,
      location: {
        lat: Number(plain.latitude),
        lon: Number(plain.longitude),
      },
      status: plain.status,
      installedAt: plain.installed_at,
      createdAt: plain.createdAt,
      updatedAt: plain.updatedAt,
    };
  }

  async findBySerialNumber(serialNumber) {
    return this.findOne({ serial_number: serialNumber });
  }

  async findBySiteId(siteId) {
    return this.findAll({ where: { site_id: siteId } });
  }
}

export const equipmentRepository = new EquipmentRepository();
