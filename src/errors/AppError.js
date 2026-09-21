export class AppError extends Error {
  /**
   * @param {string} message - сообщение об ошибке
   * @param {number} statusCode - HTTP-код
   * @param {string} code - строковый код ошибки (для клиента)
   */
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true; // флаг, что это "ожидаемая" ошибка, а не баг
    Error.captureStackTrace(this, this.constructor);
  }
}
