import { NotFoundError } from "../errors/NotFoundError.js";

export const notFound = (req, res, next) => {
  next(new NotFoundError(`Маршрут ${req.method} ${req.originalUrl} не найден`));
};
