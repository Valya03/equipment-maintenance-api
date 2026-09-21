import { BaseRepository } from "./base.repository.js";

export class RequestRepository extends BaseRepository {
  constructor() {
    super("requests.json");
  }

  /**
   * Найти все заявки по идентификатору оборудования
   * @param {string} equipmentId
   * @returns {Promise<Array>}
   */
  async findByEquipmentId(equipmentId) {
    const data = await this._readData();
    return data.filter((item) => item.equipmentId === equipmentId);
  }

  /**
   * Найти незакрытые заявки по оборудованию (статусы new и in_progress)
   * @param {string} equipmentId
   * @returns {Promise<Array>}
   */
  async findOpenByEquipmentId(equipmentId) {
    const data = await this._readData();
    return data.filter(
      (item) =>
        item.equipmentId === equipmentId &&
        ["new", "in_progress"].includes(item.status),
    );
  }
}

export const requestRepository = new RequestRepository();
