/**
 * Оборачивает асинхронный обработчик, чтобы ошибки автоматически передавались в централизованный errorHandler.
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
