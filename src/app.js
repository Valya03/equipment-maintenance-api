import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { config } from "./config/index.js";
import requestId from "./middlewares/requestId.js";
import logger from "./middlewares/logger.js";
import { notFound } from "./middlewares/notFound.js";
import { errorHandler } from "./middlewares/errorHandler.js";

import healthRoutes from "./routes/health.routes.js";
import equipmentRoutes from "./routes/equipment.routes.js";
import requestRoutes from "./routes/request.routes.js";

const app = express();

// 1. Присвоение requestId
app.use(requestId);

// 2. Логирование запросов
app.use(logger);

// 3. Защитные заголовки
app.use(helmet());

// 4. CORS - только явный список источников
app.use(
  cors({
    origin: config.corsOrigins,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

// 5. Ограничение частоты запросов на /api
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true, // заголовки RateLimit-*
  legacyHeaders: false,
  message: {
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Слишком много запросов, попробуйте позже",
    },
  },
});
app.use("/api", limiter);

// 6. Парсинг JSON с ограничением размера
app.use(express.json({ limit: "1mb" }));

// 7. Роуты
app.use("/api/health", healthRoutes);
app.use("/api/equipment", equipmentRoutes);
app.use("/api/requests", requestRoutes);

// 8. Обработчик 404
app.use(notFound);

// 9. Централизованный обработчик ошибок
app.use(errorHandler);

export default app;
