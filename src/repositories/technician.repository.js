import { Technician } from "../models/technician.model.js";
import { BaseRepository } from "./base.repository.js";

export class TechnicianRepository extends BaseRepository {
  constructor() {
    super(Technician);
  }

  _toApiFormat(instance) {
    if (!instance) return null;
    const plain = instance.get({ plain: true });
    return {
      id: plain.id,
      fullName: plain.full_name,
      specialization: plain.specialization,
      employeeNumber: plain.employee_number,
      createdAt: plain.createdAt,
      updatedAt: plain.updatedAt,
    };
  }
}

export const technicianRepository = new TechnicianRepository();
