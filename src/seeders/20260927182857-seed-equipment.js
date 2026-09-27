"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("equipment", [
      // 3 единицы на северном ветропарке
      {
        id: "bbbb0001-0000-0000-0000-000000000001",
        site_id: "11111111-1111-1111-1111-111111111111",
        name: "Турбина Т-01",
        type: "turbine",
        serial_number: "WT-N-001",
        status: "operational",
        installed_at: new Date("2021-03-15"),
        latitude: 68.9586,
        longitude: 33.0828,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "bbbb0002-0000-0000-0000-000000000002",
        site_id: "11111111-1111-1111-1111-111111111111",
        name: "Турбина Т-02",
        type: "turbine",
        serial_number: "WT-N-002",
        status: "maintenance",
        installed_at: new Date("2021-05-20"),
        latitude: 68.9587,
        longitude: 33.0829,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "bbbb0003-0000-0000-0000-000000000003",
        site_id: "11111111-1111-1111-1111-111111111111",
        name: "Инвертор И-01",
        type: "inverter",
        serial_number: "INV-N-001",
        status: "operational",
        installed_at: new Date("2022-01-10"),
        latitude: 68.9588,
        longitude: 33.083,
        created_at: new Date(),
        updated_at: new Date(),
      },
      // 3 единицы на южном ветропарке
      {
        id: "bbbb0004-0000-0000-0000-000000000004",
        site_id: "22222222-2222-2222-2222-222222222222",
        name: "Турбина Т-03",
        type: "turbine",
        serial_number: "WT-S-001",
        status: "operational",
        installed_at: new Date("2020-08-05"),
        latitude: 47.2226,
        longitude: 39.719,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "bbbb0005-0000-0000-0000-000000000005",
        site_id: "22222222-2222-2222-2222-222222222222",
        name: "Датчик Д-01",
        type: "sensor",
        serial_number: "SNS-S-001",
        status: "fault",
        installed_at: new Date("2023-02-18"),
        latitude: 47.2227,
        longitude: 39.7191,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "bbbb0006-0000-0000-0000-000000000006",
        site_id: "22222222-2222-2222-2222-222222222222",
        name: "Подстанция П-01",
        type: "substation",
        serial_number: "SUB-S-001",
        status: "operational",
        installed_at: new Date("2019-11-01"),
        latitude: 47.2228,
        longitude: 39.7192,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("equipment", null, {});
  },
};
