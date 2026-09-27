import { MaintenanceRequest } from "../models/maintenance-request.model.js";
import { BaseRepository } from "./base.repository.js";

export class RequestRepository extends BaseRepository {
  constructor() {
    super(MaintenanceRequest);
  }

  _toApiFormat(instance) {
    if (!instance) return null;
    const plain = instance.get({ plain: true });
    return {
      id: plain.id,
      equipmentId: plain.equipment_id,
      title: plain.title,
      description: plain.description,
      priority: plain.priority,
      status: plain.status,
      plannedAt: plain.planned_at,
      createdBy: plain.created_by,
      createdAt: plain.createdAt,
      updatedAt: plain.updatedAt,
    };
  }

  async findByEquipmentId(equipmentId) {
    return this.findAll({ where: { equipment_id: equipmentId } });
  }

  async findOpenByEquipmentId(equipmentId) {
    return this.findAll({
      where: {
        equipment_id: equipmentId,
        status: ["new", "in_progress"],
      },
    });
  }
}

export const requestRepository = new RequestRepository();
