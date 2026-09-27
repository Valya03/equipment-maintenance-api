"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("technicians", [
      {
        id: "aaaa0001-0000-0000-0000-000000000001",
        full_name: "Иванов Иван Иванович",
        specialization: "Механик",
        employee_number: "T-001",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "aaaa0002-0000-0000-0000-000000000002",
        full_name: "Петров Пётр Петрович",
        specialization: "Электрик",
        employee_number: "T-002",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "aaaa0003-0000-0000-0000-000000000003",
        full_name: "Сидоров Сидор Сидорович",
        specialization: "Инженер-диагност",
        employee_number: "T-003",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "aaaa0004-0000-0000-0000-000000000004",
        full_name: "Кузнецов Алексей Олегович",
        specialization: "Высотник",
        employee_number: "T-004",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "aaaa0005-0000-0000-0000-000000000005",
        full_name: "Смирнова Ольга Сергеевна",
        specialization: "Инженер КИПиА",
        employee_number: "T-005",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("technicians", null, {});
  },
};
