import Joi from "joi";

// Схема для создания оборудования (POST)
export const createEquipmentSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  type: Joi.string()
    .valid("turbine", "inverter", "sensor", "substation")
    .required(),
  serialNumber: Joi.string().required(),
  location: Joi.object({
    lat: Joi.number().min(-90).max(90).required(),
    lon: Joi.number().min(-180).max(180).required(),
  }).required(),
  status: Joi.string()
    .valid("operational", "maintenance", "fault", "decommissioned")
    .optional(),
  installedAt: Joi.date().iso().max("now").required(),
}).options({ stripUnknown: true }); // <- отбрасываю неизвестные поля

// Схема для обновления оборудования (PATCH)
export const updateEquipmentSchema = Joi.object({
  name: Joi.string().min(3).max(100),
  type: Joi.string().valid("turbine", "inverter", "sensor", "substation"),
  serialNumber: Joi.string(),
  location: Joi.object({
    lat: Joi.number().min(-90).max(90).required(),
    lon: Joi.number().min(-180).max(180).required(),
  }),
  status: Joi.string().valid(
    "operational",
    "maintenance",
    "fault",
    "decommissioned",
  ),
  installedAt: Joi.date().iso().max("now"),
})
  .min(1)
  .options({ stripUnknown: true }); // .min(1) - хотя бы одно поле для обновления
