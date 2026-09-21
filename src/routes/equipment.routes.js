import { Router } from "express";
import { equipmentController } from "../controllers/equipment.controller.js";
import { validate } from "../middlewares/validate.js";
import {
  createEquipmentSchema,
  updateEquipmentSchema,
} from "../validators/equipment.validator.js";

const router = Router();

router.get("/", equipmentController.getAll);

router.post(
  "/",
  validate({ body: createEquipmentSchema }),
  equipmentController.create,
);

router.get("/:id", equipmentController.getById);

router.patch(
  "/:id",
  validate({ body: updateEquipmentSchema }),
  equipmentController.update,
);

router.delete("/:id", equipmentController.delete);

router.get("/:id/requests", equipmentController.getRequests);

router.get("/:id/weather", equipmentController.getWeather);

export default router;
