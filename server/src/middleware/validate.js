import { z } from "zod";
import { ApiError } from "../utils/ApiError.js";
import { httpStatus } from "../constants/httpStatus.js";

export function validate(schema) {
  return async (req, res, next) => {
    try {
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }
      if (schema.query) {
        req.query = await schema.query.parseAsync(req.query);
      }
      if (schema.params) {
        req.params = await schema.params.parseAsync(req.params);
      }
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));
        next(new ApiError(httpStatus.BAD_REQUEST, "Validation failed", errors));
        return;
      }
      next(error);
    }
  };
}

