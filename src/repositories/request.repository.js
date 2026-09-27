import { MaintenanceRequest } from "../models/maintenance-request.model.js";
import { BaseRepository } from "./base.repository.js";

export class RequestRepository extends BaseRepository {
  constructor() {
    super(MaintenanceRequest);
  }

  _toApiFormat(instance) {
    if (!instance) return null;
    const plain = instance.get({ plain: true });

    const result = {
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

    // Пробрасываю связанные данные, если они были подгружены через include
    if (plain.equipment) result.equipment = plain.equipment;
    if (plain.assignees) result.assignees = plain.assignees;
    if (plain.history) result.history = plain.history;
    if (plain.assignments) result.assignments = plain.assignments;

    return result;
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
