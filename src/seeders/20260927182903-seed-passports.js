"use strict";

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert("equipment_passports", [
      {
        id: "cccc0001-0000-0000-0000-000000000001",
        equipment_id: "bbbb0001-0000-0000-0000-000000000001",
        manufacturer: "Vestas",
        model: "V150-4.2MW",
        rated_power_kw: 4200.0,
        last_verified_at: new Date("2025-06-01"),
        created_at: now,
        updated_at: now,
      },
      {
        id: "cccc0002-0000-0000-0000-000000000002",
        equipment_id: "bbbb0002-0000-0000-0000-000000000002",
        manufacturer: "Vestas",
        model: "V150-4.2MW",
        rated_power_kw: 4200.0,
        last_verified_at: new Date("2025-05-15"),
        created_at: now,
        updated_at: now,
      },
      {
        id: "cccc0003-0000-0000-0000-000000000003",
        equipment_id: "bbbb0003-0000-0000-0000-000000000003",
        manufacturer: "SMA",
        model: "Sunny Central 2500",
        rated_power_kw: 2500.0,
        last_verified_at: new Date("2025-04-20"),
        created_at: now,
        updated_at: now,
      },
      {
        id: "cccc0004-0000-0000-0000-000000000004",
        equipment_id: "bbbb0004-0000-0000-0000-000000000004",
        manufacturer: "Siemens",
        model: "SG 3.4-145",
        rated_power_kw: 3400.0,
        last_verified_at: new Date("2025-08-10"),
        created_at: now,
        updated_at: now,
      },
      {
        id: "cccc0005-0000-0000-0000-000000000005",
        equipment_id: "bbbb0005-0000-0000-0000-000000000005",
        manufacturer: "Bosch",
        model: "Sensor X100",
        rated_power_kw: null,
        last_verified_at: new Date("2025-07-05"),
        created_at: now,
        updated_at: now,
      },
      {
        id: "cccc0006-0000-0000-0000-000000000006",
        equipment_id: "bbbb0006-0000-0000-0000-000000000006",
        manufacturer: "ABB",
        model: "SubStation 220kV",
        rated_power_kw: null,
        last_verified_at: new Date("2025-03-12"),
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("equipment_passports", null, {});
  },
};
