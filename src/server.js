import "./models/index.js";
import app from "./app.js";
import { config } from "./config/index.js";
import { connectDatabase, closeDatabase } from "./config/database.js";

import "./models/index.js"; // регистрирую все модели и ассоциации

async function start() {
  try {
    // Подключаемся к БД до старта сервера
    await connectDatabase();

    const server = app.listen(config.port, () => {
      console.log(
        `Server is running on port ${config.port} in ${config.nodeEnv} mode`,
      );
    });

    // Корректное завершение: закрываем HTTP-сервер и пул соединений
    const shutdown = async (signal) => {
      console.log(`\n[${signal}] Завершение работы...`);
      server.close(async () => {
        await closeDatabase();
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("Не удалось запустить приложение:", error.message);
    process.exit(1);
  }
}

start();
