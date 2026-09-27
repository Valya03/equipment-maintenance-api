import { Router } from "express";
import { siteController } from "../controllers/site.controller.js";

const router = Router();

router.get("/:id/summary", siteController.getSummary);

export default router;
