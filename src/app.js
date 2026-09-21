import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config/index.js";
import requestId from "./middlewares/requestId.js";
import logger from "./middlewares/logger.js";
import healthRoutes from "./routes/health.routes.js";
// ... другие роуты
import notFound from "./middlewares/notFound.js";
import errorHandler from "./middlewares/errorHandler.js";

const app = express();

// Порядок middleware важен
app.use(requestId); // 1. Присвоение ID
app.use(logger); // 2. Логирование (ID нужен раньше)
app.use(helmet()); // 3. Защитные заголовки
app.use(cors({ origin: config.corsOrigins })); // 4. CORS
app.use(express.json({ limit: "1mb" })); // 5. Парсинг JSON с ограничением размера

// Роуты
app.use("/api/health", healthRoutes);
// app.use('/api/equipment', equipmentRoutes);
// app.use('/api/requests', requestRoutes);

// 6. Обработчик 404
app.use(notFound);

// 7. Централизованный обработчик ошибок
app.use(errorHandler);

export default app;
