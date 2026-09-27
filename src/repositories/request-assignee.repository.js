import { RequestAssignee } from "../models/request-assignee.model.js";
import { BaseRepository } from "./base.repository.js";

export class RequestAssigneeRepository extends BaseRepository {
  constructor() {
    super(RequestAssignee);
  }

  _toApiFormat(instance) {
    if (!instance) return null;
    const plain = instance.get({ plain: true });
    return {
      id: plain.id,
      requestId: plain.request_id,
      technicianId: plain.technician_id,
      role: plain.role,
      hours: Number(plain.hours),
      createdAt: plain.createdAt,
    };
  }

  async findByRequestId(requestId) {
    return this.findAll({ where: { request_id: requestId } });
  }

  async countLeads(requestId, options = {}) {
    return this.model.count({
      where: { request_id: requestId, role: "lead" },
      ...options,
    });
  }
}

export const requestAssigneeRepository = new RequestAssigneeRepository();
