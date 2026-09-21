import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class BaseRepository {
  /**
   * @param {string} fileName - имя JSON-файла (например, 'equipment.json')
   */
  constructor(fileName) {
    this.filePath = path.join(__dirname, "..", "data", fileName);
  }

  /**
   * Чтение данных из файла
   * @returns {Promise<Array>}
   */
  async _readData() {
    try {
      const raw = await fs.readFile(this.filePath, "utf-8");
      return JSON.parse(raw);
    } catch (error) {
      if (error.code === "ENOENT") {
        // Файла нет , возвращаю пустой массив
        return [];
      }
      throw error;
    }
  }

  /**
   * Запись данных в файл
   * @param {Array} data
   */
  async _writeData(data) {
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), "utf-8");
  }

  /**
   * Получить все записи
   * @returns {Promise<Array>}
   */
  async findAll() {
    return this._readData();
  }

  /**
   * Найти запись по id
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    const data = await this._readData();
    return data.find((item) => item.id === id) || null;
  }

  /**
   * Найти одну запись по произвольному предикату
   * @param {Function} predicate
   * @returns {Promise<Object|null>}
   */
  async findOne(predicate) {
    const data = await this._readData();
    return data.find(predicate) || null;
  }

  /**
   * Создать запись
   * @param {Object} entity
   * @returns {Promise<Object>}
   */
  async create(entity) {
    const data = await this._readData();
    data.push(entity);
    await this._writeData(data);
    return entity;
  }

  /**
   * Обновить запись по id
   * @param {string} id
   * @param {Object} updates
   * @returns {Promise<Object|null>}
   */
  async update(id, updates) {
    const data = await this._readData();
    const index = data.findIndex((item) => item.id === id);
    if (index === -1) return null;

    data[index] = { ...data[index], ...updates };
    await this._writeData(data);
    return data[index];
  }

  /**
   * Удалить запись по id
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    const data = await this._readData();
    const index = data.findIndex((item) => item.id === id);
    if (index === -1) return false;

    data.splice(index, 1);
    await this._writeData(data);
    return true;
  }
}
