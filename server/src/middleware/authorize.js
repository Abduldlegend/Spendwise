import { ApiError } from "../utils/ApiError.js";
import { httpStatus } from "../constants/httpStatus.js";

/**
 * Role gate for admin-only routes. Must run after `authenticate`.
 *
 * The role travels in the access token (15 min TTL); a demotion therefore takes
 * effect on the next token refresh at the latest.
 *
 * @param {...string} roles allowed roles
 */
export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized request"));
    }
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(httpStatus.FORBIDDEN, "You do not have access to this resource"));
    }
    return next();
  };
}
