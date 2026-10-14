import { OAuth2Client } from "google-auth-library";

import config from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { httpStatus } from "../constants/httpStatus.js";
import { User } from "../models/User.js";
import { Account } from "../models/Account.js";
import { comparePassword, hashPassword } from "../utils/password.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { serializeUser } from "../utils/serialize.js";

const googleClient = new OAuth2Client(config.googleClientId);

function normalizeEmail(email) {
  return String(email ?? "").trim().toLowerCase();
}

/** Ensures the user has their one account (single account per user). */
async function ensureAccount(user) {
  const existing = await Account.findOne({ userId: user._id });
  if (existing) return existing;
  return Account.create({
    userId: user._id,
    baseCurrency: user.baseCurrency,
    kycTier: user.kycTier,
    kycLimitCents: user.kycLimitCents,
    provider: user.provider,
  });
}

function buildTokens(user, account) {
  const payload = { sub: user._id.toString(), aid: account._id.toString(), email: user.email };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken({ sub: payload.sub, aid: payload.aid }),
  };
}

async function session(user, account) {
  const { accessToken, refreshToken } = buildTokens(user, account);
  return { accessToken, refreshToken, user: serializeUser(user) };
}

export const authService = {
  async register({ name, fullName, email, password }) {
    const normalized = normalizeEmail(email);
    if (!normalized) throw new ApiError(httpStatus.BAD_REQUEST, "Email is required");

    const existing = await User.findOne({ email: normalized });
    if (existing) {
      throw new ApiError(httpStatus.CONFLICT, "An account with this email already exists");
    }

    const user = await User.create({
      name: (name ?? fullName ?? "").trim() || normalized.split("@")[0],
      email: normalized,
      passwordHash: await hashPassword(password),
      provider: "password",
    });
    const account = await ensureAccount(user);
    return session(user, account);
  },

  async login({ email, password }) {
    const normalized = normalizeEmail(email);
    const user = await User.findOne({ email: normalized }).select("+passwordHash");
    if (!user || !user.passwordHash) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect email or password");
    }
    const ok = await comparePassword(password, user.passwordHash);
    if (!ok) throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect email or password");

    user.lastLoginAt = new Date();
    await user.save();
    const account = await ensureAccount(user);
    return session(user, account);
  },

  async google({ credential }) {
    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: config.googleClientId,
      });
      payload = ticket.getPayload();
    } catch {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid Google credential");
    }

    if (!payload?.email) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid Google credential");
    }

    const normalized = normalizeEmail(payload.email);
    let user = await User.findOne({ email: normalized });
    if (user) {
      user.name = payload.name?.trim() || user.name;
      user.avatarUrl = payload.picture ?? user.avatarUrl;
      user.lastLoginAt = new Date();
      await user.save();
    } else {
      user = await User.create({
        name: payload.name?.trim() || normalized.split("@")[0],
        email: normalized,
        provider: "google",
        avatarUrl: payload.picture ?? null,
        lastLoginAt: new Date(),
      });
    }
    const account = await ensureAccount(user);
    return session(user, account);
  },

  async refresh(refreshToken) {
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid or expired refresh token");
    }
    const user = await User.findById(decoded.sub);
    if (!user || !user.isActive) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Session no longer valid");
    }
    const account = await Account.findById(decoded.aid);
    if (!account) throw new ApiError(httpStatus.UNAUTHORIZED, "Session no longer valid");
    return session(user, account);
  },
};
