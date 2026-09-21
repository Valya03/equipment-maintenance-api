import { equipmentService } from "../services/equipment.service.js";
import { weatherService } from "../services/weather.service.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

export const equipmentController = {
  // GET /api/equipment
  getAll: asyncHandler(async (req, res) => {
    const result = await equipmentService.getAll(req.query);
    res.status(200).json(result);
  }),

  // GET /api/equipment/:id
  getById: asyncHandler(async (req, res) => {
    const equipment = await equipmentService.getById(req.params.id);
    res.status(200).json({ data: equipment });
  }),

  // POST /api/equipment
  create: asyncHandler(async (req, res) => {
    const equipment = await equipmentService.create(req.body);
    res
      .status(201)
      .location(`/api/equipment/${equipment.id}`)
      .json({ data: equipment });
  }),

  // PATCH /api/equipment/:id
  update: asyncHandler(async (req, res) => {
    const equipment = await equipmentService.update(req.params.id, req.body);
    res.status(200).json({ data: equipment });
  }),

  // DELETE /api/equipment/:id
  delete: asyncHandler(async (req, res) => {
    await equipmentService.delete(req.params.id);
    res.status(204).send();
  }),

  // GET /api/equipment/:id/requests
  getRequests: asyncHandler(async (req, res) => {
    const requests = await equipmentService.getRequestsByEquipmentId(
      req.params.id,
    );
    res.status(200).json({ data: requests });
  }),

  // GET /api/equipment/:id/weather
  getWeather: asyncHandler(async (req, res) => {
    const weather = await weatherService.getWeatherForEquipment(req.params.id);
    res.status(200).json({ data: weather });
  }),
};
