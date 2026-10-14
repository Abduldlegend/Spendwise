import { profileService } from "../services/profile.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { httpStatus } from "../constants/httpStatus.js";

export const profileController = {
  get: asyncHandler(async (req, res) => {
    res.status(httpStatus.OK).json(await profileService.get(req.accountId));
  }),

  update: asyncHandler(async (req, res) => {
    res.status(httpStatus.OK).json(await profileService.update(req.accountId, req.body));
  }),
};
