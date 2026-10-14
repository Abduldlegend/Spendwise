import { railService } from "../services/rail.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { httpStatus } from "../constants/httpStatus.js";

export const railController = {
  list: asyncHandler(async (req, res) => {
    res.status(httpStatus.OK).json(await railService.list(req.accountId));
  }),

  create: asyncHandler(async (req, res) => {
    res.status(httpStatus.CREATED).json(await railService.create(req.accountId, req.body));
  }),

  remove: asyncHandler(async (req, res) => {
    await railService.remove(req.accountId, req.params.id);
    res.status(httpStatus.NO_CONTENT).end();
  }),
};
