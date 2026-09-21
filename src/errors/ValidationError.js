import { AppError } from "./AppError.js";

export class ValidationError extends AppError {
  /**
   * @param {string} message - общее сообщение
   * @param {Array} details - массив { field, message }
   */
  constructor(message = "Некорректные данные запроса", details = []) {
    super(message, 400, "VALIDATION_ERROR");
    this.details = details;
  }
}
