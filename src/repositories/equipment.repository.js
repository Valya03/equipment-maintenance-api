import { BaseRepository } from "./base.repository.js";

export class EquipmentRepository extends BaseRepository {
  constructor() {
    super("equipment.json");
  }

  /**
   * Найти оборудование по серийному номеру
   * @param {string} serialNumber
   * @returns {Promise<Object|null>}
   */
  async findBySerialNumber(serialNumber) {
    return this.findOne((item) => item.serialNumber === serialNumber);
  }
}

export const equipmentRepository = new EquipmentRepository();
