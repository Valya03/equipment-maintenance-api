import { reportService } from "../services/report.service.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

export const reportController = {
  getEquipmentLoad: asyncHandler(async (req, res) => {
    const report = await reportService.getEquipmentLoad(req.query);
    res.status(200).json({ data: report });
  }),
};
