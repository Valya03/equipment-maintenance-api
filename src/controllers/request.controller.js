import { requestService } from "../services/request.service.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

export const requestController = {
  // GET /api/requests
  getAll: asyncHandler(async (req, res) => {
    const result = await requestService.getAll(req.query);
    res.status(200).json(result);
  }),

  // GET /api/requests/:id
  getById: asyncHandler(async (req, res) => {
    const request = await requestService.getById(req.params.id);
    res.status(200).json({ data: request });
  }),

  // POST /api/requests
  create: asyncHandler(async (req, res) => {
    const request = await requestService.create(req.body);
    res
      .status(201)
      .location(`/api/requests/${request.id}`)
      .json({ data: request });
  }),

  // PATCH /api/requests/:id
  update: asyncHandler(async (req, res) => {
    const request = await requestService.update(req.params.id, req.body);
    res.status(200).json({ data: request });
  }),

  // PATCH /api/requests/:id/status
  updateStatus: asyncHandler(async (req, res) => {
    const request = await requestService.updateStatus(
      req.params.id,
      req.body.status,
    );
    res.status(200).json({ data: request });
  }),

  // DELETE /api/requests/:id
  delete: asyncHandler(async (req, res) => {
    await requestService.delete(req.params.id);
    res.status(204).send();
  }),
};
