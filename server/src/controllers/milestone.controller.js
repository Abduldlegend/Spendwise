import { milestoneService } from "../services/milestone.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { httpStatus } from "../constants/httpStatus.js";

export const milestoneController = {
  list: asyncHandler(async (req, res) => {
    res.status(httpStatus.OK).json(await milestoneService.list(req.accountId));
  }),

  create: asyncHandler(async (req, res) => {
    res.status(httpStatus.CREATED).json(await milestoneService.create(req.accountId, req.body));
  }),

  update: asyncHandler(async (req, res) => {
    res.status(httpStatus.OK).json(await milestoneService.update(req.accountId, req.params.id, req.body));
  }),
};
