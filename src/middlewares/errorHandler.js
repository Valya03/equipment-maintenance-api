import { config } from "../config/index.js";

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const code = err.code || "INTERNAL_ERROR";
  const message = err.message || "Внутренняя ошибка сервера";

  // Логирую ошибку с requestId
  console.error(`[${req.id}] ${statusCode} ${code}: ${message}`);

  const response = {
    error: {
      code,
      message,
      requestId: req.id,
    },
  };

  // Добавляю details для ValidationError
  if (err.details) {
    response.error.details = err.details;
  }

  // В production не показываю стек
  if (config.nodeEnv !== "production" && err.stack) {
    response.error.stack = err.stack;
  }

  res.status(statusCode).json(response);
};
