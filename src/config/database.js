import { Sequelize } from "sequelize";
import { config } from "./index.js";

export const sequelize = new Sequelize(
  config.db.database,
  config.db.username,
  config.db.password,
  {
    host: config.db.host,
    port: config.db.port,
    dialect: config.db.dialect,
    logging: config.db.logging,
    pool: config.db.pool,
  },
);

/**
 * Проверка подключения к БД при старте приложения.
 * Если БД недоступна,то выбрасываю понятную ошибку.
 */
export async function connectDatabase() {
  try {
    await sequelize.authenticate();
    console.log(
      `[DB] Подключение к PostgreSQL (${config.db.host}:${config.db.port}/${config.db.database}) установлено`,
    );
  } catch (error) {
    console.error("[DB] Не удалось подключиться к PostgreSQL:", error.message);
    throw error;
  }
}

/**
 * Аккуратное закрытие пула соединений при остановке приложения.
 */
export async function closeDatabase() {
  await sequelize.close();
  console.log("[DB] Соединение с PostgreSQL закрыто");
}
