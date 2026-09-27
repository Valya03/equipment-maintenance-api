"use strict";

const priorities = ["low", "medium", "high", "critical"];
const statuses = ["new", "in_progress", "done", "rejected"];

module.exports = {
  async up(queryInterface) {
    const equipmentIds = [
      "bbbb0001-0000-0000-0000-000000000001",
      "bbbb0002-0000-0000-0000-000000000002",
      "bbbb0003-0000-0000-0000-000000000003",
      "bbbb0004-0000-0000-0000-000000000004",
      "bbbb0005-0000-0000-0000-000000000005",
      "bbbb0006-0000-0000-0000-000000000006",
    ];

    const requests = [];
    for (let i = 1; i <= 20; i++) {
      const status = statuses[i % statuses.length];
      const createdAt = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      requests.push({
        id: `dddd${String(i).padStart(4, "0")}-0000-0000-0000-000000000001`,
        equipment_id: equipmentIds[i % equipmentIds.length],
        title: `Заявка на ТО №${i}`,
        description: `Описание работ по заявке №${i}`,
        priority: priorities[i % priorities.length],
        status,
        planned_at: new Date(createdAt.getTime() + 3 * 24 * 60 * 60 * 1000),
        created_by: "system",
        created_at: createdAt,
        updated_at: createdAt,
      });
    }
    await queryInterface.bulkInsert("maintenance_requests", requests);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("maintenance_requests", null, {});
  },
};
