import { Account } from "../models/Account.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { httpStatus } from "../constants/httpStatus.js";
import { toCents } from "../utils/money.js";
import { serializeUser } from "../utils/serialize.js";

async function resolveUser(accountId) {
  const account = await Account.findById(accountId);
  if (!account) throw new ApiError(httpStatus.UNAUTHORIZED, "Account not found");
  const user = await User.findById(account.userId);
  if (!user) throw new ApiError(httpStatus.UNAUTHORIZED, "Account not found");
  return user;
}

export const profileService = {
  async get(accountId) {
    return serializeUser(await resolveUser(accountId));
  },

  async update(accountId, body) {
    const user = await resolveUser(accountId);
    if (body.name !== undefined) user.name = body.name;
    if (body.baseCurrency !== undefined) user.baseCurrency = body.baseCurrency;
    if (body.kycTier !== undefined) user.kycTier = body.kycTier;
    if (body.kycLimit !== undefined) user.kycLimitCents = toCents(body.kycLimit);
    await user.save();
    return serializeUser(user);
  },
};
