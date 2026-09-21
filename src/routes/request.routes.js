import { Router } from "express";
import { requestController } from "../controllers/request.controller.js";
import { validate } from "../middlewares/validate.js";
import {
  createRequestSchema,
  updateRequestSchema,
  updateStatusSchema,
} from "../validators/request.validator.js";

const router = Router();

router.get("/", requestController.getAll);

router.post(
  "/",
  validate({ body: createRequestSchema }),
  requestController.create,
);

router.get("/:id", requestController.getById);

router.patch(
  "/:id",
  validate({ body: updateRequestSchema }),
  requestController.update,
);

router.patch(
  "/:id/status",
  validate({ body: updateStatusSchema }),
  requestController.updateStatus,
);

router.delete("/:id", requestController.delete);

export default router;
