import { categoryService } from "../services/category.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { httpStatus } from "../constants/httpStatus.js";

export const categoryController = {
  list: asyncHandler(async (req, res) => {
    res.status(httpStatus.OK).json(await categoryService.listEnabled());
  }),
};
