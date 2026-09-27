import { ValidationError } from "../errors/ValidationError.js";

/**
 * @param {Object} schemas - { body?: JoiSchema, params?: JoiSchema, query?: JoiSchema }
 */
export const validate = (schemas) => (req, res, next) => {
  const errors = [];

  if (schemas.body) {
    const { error, value } = schemas.body.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      error.details.forEach((d) =>
        errors.push({ field: d.path.join("."), message: d.message }),
      );
    } else {
      req.body = value; // заменяем на очищенные данные
    }
  }

  if (schemas.query) {
    const { error, value } = schemas.query.validate(req.query, {
      abortEarly: false,
    });
    if (error) {
      error.details.forEach((d) =>
        errors.push({ field: d.path.join("."), message: d.message }),
      );
    } else {
      Object.defineProperty(req, "query", {
        value,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    }
  }

  if (schemas.query) {
    const { error, value } = schemas.query.validate(req.query, {
      abortEarly: false,
    });
    if (error) {
      error.details.forEach((d) =>
        errors.push({ field: d.path.join("."), message: d.message }),
      );
    } else {
      Object.defineProperty(req, "query", {
        value,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    }
  }

  if (errors.length > 0) {
    return next(new ValidationError("Некорректные данные запроса", errors));
  }

  next();
};
