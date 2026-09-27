"use strict";

module.exports = {
  async up(queryInterface) {
    const technicianIds = [
      "aaaa0001-0000-0000-0000-000000000001",
      "aaaa0002-0000-0000-0000-000000000002",
      "aaaa0003-0000-0000-0000-000000000003",
      "aaaa0004-0000-0000-0000-000000000004",
      "aaaa0005-0000-0000-0000-000000000005",
    ];

    // Назначаем бригаду на первые 10 заявок (1 lead + 1 member)
    const assignees = [];
    for (let i = 1; i <= 10; i++) {
      const requestId = `dddd${String(i).padStart(4, "0")}-0000-0000-0000-000000000001`;
      assignees.push({
        id: `eeee${String(i).padStart(4, "0")}-0001-0000-0000-000000000001`,
        request_id: requestId,
        technician_id: technicianIds[i % technicianIds.length],
        role: "lead",
        hours: 8.0,
        created_at: new Date(),
      });
      assignees.push({
        id: `eeee${String(i).padStart(4, "0")}-0002-0000-0000-000000000002`,
        request_id: requestId,
        technician_id: technicianIds[(i + 1) % technicianIds.length],
        role: "member",
        hours: 6.0,
        created_at: new Date(),
      });
    }
    await queryInterface.bulkInsert("request_assignees", assignees);

    // История статусов: создаём записи для заявок со статусами done и in_progress
    const history = [];
    for (let i = 1; i <= 20; i++) {
      const requestId = `dddd${String(i).padStart(4, "0")}-0000-0000-0000-000000000001`;
      const status = ["new", "in_progress", "done", "rejected"][i % 4];

      history.push({
        id: `ffff${String(i).padStart(4, "0")}-0000-0000-0000-000000000001`,
        request_id: requestId,
        old_status: null,
        new_status: "new",
        changed_by: "system",
        comment: "Заявка создана",
        changed_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      });

      if (status !== "new") {
        history.push({
          id: `ffff${String(i).padStart(4, "0")}-0000-0000-0000-000000000002`,
          request_id: requestId,
          old_status: "new",
          new_status: status,
          changed_by: "system",
          comment: `Смена на ${status}`,
          changed_at: new Date(Date.now() - (i - 1) * 24 * 60 * 60 * 1000),
        });
      }
    }
    await queryInterface.bulkInsert("request_status_history", history);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("request_status_history", null, {});
    await queryInterface.bulkDelete("request_assignees", null, {});
  },
};
