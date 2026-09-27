export class BaseRepository {
  /**
   * @param {import('sequelize').ModelStatic<any>} model - Sequelize-модель
   */
  constructor(model) {
    this.model = model;
  }

  /**
   * Преобразование модели в объект для API.
   * Подклассы могут переопределить для смены формата полей.
   */
  _toApiFormat(instance) {
    if (!instance) return null;
    return instance.get({ plain: true });
  }

  /**
   * Универсальный поиск с фильтрами, сортировкой и пагинацией.
   * @param {Object} params - { where, order, limit, offset, include }
   */
  async findAll(params = {}) {
    const items = await this.model.findAll(params);
    return items.map((i) => this._toApiFormat(i));
  }

  /**
   * Поиск с подсчётом общего количества (для мета-информации пагинации).
   */
  async findAndCountAll(params = {}) {
    const result = await this.model.findAndCountAll(params);
    return {
      rows: result.rows.map((i) => this._toApiFormat(i)),
      count: result.count,
    };
  }

  async findById(id, options = {}) {
    const item = await this.model.findByPk(id, options);
    return item ? this._toApiFormat(item) : null;
  }

  async findOne(where, options = {}) {
    const item = await this.model.findOne({ where, ...options });
    return item ? this._toApiFormat(item) : null;
  }

  async create(entity, options = {}) {
    const created = await this.model.create(entity, options);
    return this._toApiFormat(created);
  }

  async update(id, updates, options = {}) {
    const [affectedCount] = await this.model.update(updates, {
      where: { id },
      ...options,
    });
    if (affectedCount === 0) return null;
    return this.findById(id, options);
  }

  async delete(id, options = {}) {
    const deletedCount = await this.model.destroy({
      where: { id },
      ...options,
    });
    return deletedCount > 0;
  }
}
