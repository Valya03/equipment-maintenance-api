"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("sites", [
      {
        id: "11111111-1111-1111-1111-111111111111",
        name: "Северный ветропарк",
        code: "NWP-01",
        region: "Мурманская область",
        latitude: 68.9585,
        longitude: 33.0827,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "22222222-2222-2222-2222-222222222222",
        name: "Южный ветропарк",
        code: "SWP-02",
        region: "Ростовская область",
        latitude: 47.2225,
        longitude: 39.7189,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("sites", null, {});
  },
};
