"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("request_status_history", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      request_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "maintenance_requests", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      old_status: {
        type: Sequelize.ENUM("new", "in_progress", "done", "rejected"),
        allowNull: true,
      },
      new_status: {
        type: Sequelize.ENUM("new", "in_progress", "done", "rejected"),
        allowNull: false,
      },
      changed_by: { type: Sequelize.STRING(100), allowNull: true },
      comment: { type: Sequelize.TEXT, allowNull: true },
      changed_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("request_status_history");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_request_status_history_old_status";',
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_request_status_history_new_status";',
    );
  },
};
