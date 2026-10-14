import { ApiError } from "../utils/ApiError.js";
import { httpStatus } from "../constants/httpStatus.js";
import config from "../config/env.js";

/** Normalises any thrown value into `{ statusCode, message, errors }`. */
function normalize(err) {
  if (err instanceof ApiError) {
    return { statusCode: err.statusCode, message: err.message, errors: err.errors ?? [] };
  }

  if (err?.name === "ValidationError" && err.errors) {
    const errors = Object.values(err.errors).map((field) => ({
      field: field.path,
      message: field.message,
    }));
    return { statusCode: httpStatus.BAD_REQUEST, message: "Validation failed", errors };
  }

  if (err?.code === 11000) {
    const field = Object.keys(err.keyValue ?? {})[0] ?? "field";
    return {
      statusCode: httpStatus.CONFLICT,
      message: `Duplicate value for ${field}`,
      errors: [{ field, message: "Already in use" }],
    };
  }

  if (err?.name === "CastError") {
    return {
      statusCode: httpStatus.BAD_REQUEST,
      message: `Invalid value for ${err.path}`,
      errors: [],
    };
  }

  if (err?.name === "JsonWebTokenError" || err?.name === "TokenExpiredError") {
    return { statusCode: httpStatus.UNAUTHORIZED, message: "Invalid or expired token", errors: [] };
  }

  return {
    statusCode: err?.statusCode ?? httpStatus.INTERNAL_SERVER_ERROR,
    message: err?.message ?? "Internal Server Error",
    errors: [],
  };
}

// Express recognises error middleware by its four-argument signature.
export const errorHandler = (err, _req, res, _next) => {
  const { statusCode, message, errors } = normalize(err);

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message: statusCode >= 500 && config.env === "production" ? "Internal Server Error" : message,
    errors,
  });
};
