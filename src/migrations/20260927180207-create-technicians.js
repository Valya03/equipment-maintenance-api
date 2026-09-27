"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("technicians", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      full_name: { type: Sequelize.STRING(150), allowNull: false },
      specialization: { type: Sequelize.STRING(100), allowNull: false },
      employee_number: {
        type: Sequelize.STRING(30),
        allowNull: false,
        unique: true,
      },
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
    await queryInterface.dropTable("technicians");
  },
};
