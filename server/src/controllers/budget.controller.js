import { budgetService } from "../services/budget.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { httpStatus } from "../constants/httpStatus.js";

export const budgetController = {
  list: asyncHandler(async (req, res) => {
    res.status(httpStatus.OK).json(await budgetService.list(req.accountId));
  }),

  create: asyncHandler(async (req, res) => {
    res.status(httpStatus.CREATED).json(await budgetService.create(req.accountId, req.body));
  }),

  update: asyncHandler(async (req, res) => {
    res.status(httpStatus.OK).json(await budgetService.update(req.accountId, req.params.id, req.body));
  }),
};
