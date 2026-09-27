"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("equipment", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      site_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "sites", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      name: { type: Sequelize.STRING(100), allowNull: false },
      type: {
        type: Sequelize.ENUM("turbine", "inverter", "sensor", "substation"),
        allowNull: false,
      },
      serial_number: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      status: {
        type: Sequelize.ENUM(
          "operational",
          "maintenance",
          "fault",
          "decommissioned",
        ),
        allowNull: false,
        defaultValue: "operational",
      },
      installed_at: { type: Sequelize.DATE, allowNull: false },
      latitude: { type: Sequelize.DECIMAL(9, 6), allowNull: false },
      longitude: { type: Sequelize.DECIMAL(9, 6), allowNull: false },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("equipment");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_equipment_type";',
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_equipment_status";',
    );
  },
};
