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

export const assignTeamSchema = Joi.object({
  assignees: Joi.array()
    .items(
      Joi.object({
        technicianId: Joi.string().uuid().required(),
        role: Joi.string().valid("lead", "member").required(),
        hours: Joi.number().min(0).max(1000).required(),
      }),
    )
    .min(1)
    .required(),
}).options({ stripUnknown: true });
