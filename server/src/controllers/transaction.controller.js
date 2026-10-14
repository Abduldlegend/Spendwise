import { transactionService } from "../services/transaction.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { httpStatus } from "../constants/httpStatus.js";

export const transactionController = {
  list: asyncHandler(async (req, res) => {
    res.status(httpStatus.OK).json(await transactionService.list(req.accountId, req.query));
  }),

  create: asyncHandler(async (req, res) => {
    res.status(httpStatus.CREATED).json(await transactionService.create(req.accountId, req.body));
  }),

  update: asyncHandler(async (req, res) => {
    res.status(httpStatus.OK).json(await transactionService.update(req.accountId, req.params.id, req.body));
  }),

  remove: asyncHandler(async (req, res) => {
    await transactionService.remove(req.accountId, req.params.id);
    res.status(httpStatus.NO_CONTENT).end();
  }),
};
