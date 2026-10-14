import config from "../config/env.js";
import { authService } from "../services/auth.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { httpStatus } from "../constants/httpStatus.js";
import { ApiError } from "../utils/ApiError.js";

const ACCESS_MAX_AGE = 15 * 60 * 1000;
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const REFRESH_PATH = `${config.apiPrefix}/auth`;

function cookieOptions(maxAge, path = "/") {
  return {
    httpOnly: true,
    secure: config.cookie.secure,
    sameSite: config.cookie.sameSite,
    maxAge,
    path,
  };
}

/** Mirrors the session onto httpOnly cookies while still returning the bearer token. */
function setSessionCookies(res, { accessToken, refreshToken }) {
  res.cookie("access_token", accessToken, cookieOptions(ACCESS_MAX_AGE));
  res.cookie("refresh_token", refreshToken, cookieOptions(REFRESH_MAX_AGE, REFRESH_PATH));
}

function clearSessionCookies(res) {
  res.clearCookie("access_token", cookieOptions(0));
  res.clearCookie("refresh_token", cookieOptions(0, REFRESH_PATH));
}

export const authController = {
  register: asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);
    setSessionCookies(res, result);
    res.status(httpStatus.CREATED).json({ success: true, token: result.accessToken, user: result.user });
  }),

  login: asyncHandler(async (req, res) => {
    const result = await authService.login(req.body);
    setSessionCookies(res, result);
    res.status(httpStatus.OK).json({ success: true, token: result.accessToken, user: result.user });
  }),

  google: asyncHandler(async (req, res) => {
    const result = await authService.google(req.body);
    setSessionCookies(res, result);
    res.status(httpStatus.OK).json({ success: true, token: result.accessToken, user: result.user });
  }),

  refresh: asyncHandler(async (req, res) => {
    const token = req.cookies?.refresh_token;
    if (!token) throw new ApiError(httpStatus.UNAUTHORIZED, "Missing refresh token");
    const result = await authService.refresh(token);
    setSessionCookies(res, result);
    res.status(httpStatus.OK).json({ success: true, token: result.accessToken, user: result.user });
  }),

  logout: asyncHandler(async (req, res) => {
    clearSessionCookies(res);
    res.status(httpStatus.NO_CONTENT).end();
  }),
};
