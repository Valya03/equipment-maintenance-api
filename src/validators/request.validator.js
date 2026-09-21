import Joi from "joi";

// Схема для создания заявки (POST)
export const createRequestSchema = Joi.object({
  equipmentId: Joi.string().uuid().required(),
  title: Joi.string().min(5).max(120).required(),
  description: Joi.string().max(2000).allow("").optional(),
  priority: Joi.string().valid("low", "medium", "high", "critical").required(),
  status: Joi.string()
    .valid("new", "in_progress", "done", "rejected")
    .optional(),
  plannedAt: Joi.date().iso().optional(),
}).options({ stripUnknown: true });

// Схема для обновления заявки (PATCH)
export const updateRequestSchema = Joi.object({
  title: Joi.string().min(5).max(120),
  description: Joi.string().max(2000).allow(""),
  priority: Joi.string().valid("low", "medium", "high", "critical"),
  plannedAt: Joi.date().iso(),
})
  .min(1)
  .options({ stripUnknown: true });

// Схема для смены статуса
export const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid("new", "in_progress", "done", "rejected")
    .required(),
}).options({ stripUnknown: true });
