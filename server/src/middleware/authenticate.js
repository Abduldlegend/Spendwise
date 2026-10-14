import { ApiError } from "../utils/ApiError.js";
import { httpStatus } from "../constants/httpStatus.js";
import { verifyAccessToken } from "../utils/jwt.js";

export async function authenticate(req, res, next) {
  try {
    let token = null;
    const authHeader = req.headers?.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring("Bearer ".length);
    }
    if (!token && req.cookies?.access_token) {
      token = req.cookies.access_token;
    }
    if (!token) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized request");
    }
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    req.accountId = decoded.aid || decoded.accountId || decoded.sub;
    next();
  } catch {
    next(new ApiError(httpStatus.UNAUTHORIZED, "Invalid or expired access token"));
  }
}

