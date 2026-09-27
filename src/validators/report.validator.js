import Joi from "joi";

export const equipmentLoadQuerySchema = Joi.object({
  minRequests: Joi.number().integer().min(0).max(10000).optional(),
  dateFrom: Joi.date().iso().optional(),
  dateTo: Joi.date().iso().optional(),
}).options({ stripUnknown: true });
