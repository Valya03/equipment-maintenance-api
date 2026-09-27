import { siteService } from "../services/site.service.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

export const siteController = {
  getSummary: asyncHandler(async (req, res) => {
    const summary = await siteService.getSummary(req.params.id);
    res.status(200).json({ data: summary });
  }),
};
