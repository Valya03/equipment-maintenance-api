import { models, sequelize } from "./src/models/index.js";

try {
  await sequelize.authenticate();
  console.log("Подключение к БД через Sequelize установлено");
  console.log(
    "Загружены модели:",
    Object.keys(models).filter((k) => k !== "sequelize"),
  );
  await sequelize.close();
} catch (error) {
  console.error("Ошибка:", error);
  process.exit(1);
}
