import mongoose from "mongoose";

import { Account } from "../models/Account.js";
import { AuditLog } from "../models/AuditLog.js";
import { Budget } from "../models/Budget.js";
import { Category } from "../models/Category.js";
import { Milestone } from "../models/Milestone.js";
import { Rail } from "../models/Rail.js";
import { Transaction } from "../models/Transaction.js";
import { User } from "../models/User.js";
import { auditService } from "./audit.service.js";
import { ApiError } from "../utils/ApiError.js";
import { httpStatus } from "../constants/httpStatus.js";
import { KYC_TIER_LIMITS_CENTS } from "../constants/enums.js";
import { dbState } from "../config/db.js";
import { toAmount } from "../utils/money.js";
import { serializeAuditLog } from "../utils/serialize.js";

/**
 * Admin operations are aggregated, never row-level.
 *
 * Every read here returns counts, metadata or macro composition. Transaction
 * amounts, balances, notes and descriptions never leave this service, and the
 * user directory carries counts only — the zero-knowledge policy is enforced at
 * the query level, not by the UI.
 */

const DAY_MS = 86_400_000;
const WINDOWS = { "7d": 7, "30d": 30, "90d": 90 };
const SORT = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  name: { name: 1 },
  last_login: { lastLoginAt: -1 },
};

function startOfUtcDay(value) {
  return Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());
}

function windowStart(days) {
  return new Date(startOfUtcDay(new Date()) - (days - 1) * DAY_MS);
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function dailySeries(Model, match, days) {
  const rows = await Model.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "UTC" } },
        count: { $sum: 1 },
      },
    },
  ]);
  const counts = new Map(rows.map((row) => [row._id, row.count]));
  const today = startOfUtcDay(new Date());
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today - (days - 1 - index) * DAY_MS).toISOString().slice(0, 10);
    return { date, count: counts.get(date) ?? 0 };
  });
}

async function countByAccount(Model, accountIds) {
  if (accountIds.length === 0) return new Map();
  const rows = await Model.aggregate([
    { $match: { accountId: { $in: accountIds } } },
    { $group: { _id: "$accountId", count: { $sum: 1 } } },
  ]);
  return new Map(rows.map((row) => [String(row._id), row.count]));
}

async function countsForAccounts(accountIds) {
  const [transactions, budgets, milestones, rails] = await Promise.all([
    countByAccount(Transaction, accountIds),
    countByAccount(Budget, accountIds),
    countByAccount(Milestone, accountIds),
    countByAccount(Rail, accountIds),
  ]);
  return { transactions, budgets, milestones, rails };
}

function serializeAdminUser(user, account, counts) {
  const accountId = account?._id ? String(account._id) : null;
  const at = (map) => (accountId ? map.get(accountId) ?? 0 : 0);
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role ?? "user",
    provider: user.provider,
    avatarUrl: user.avatarUrl ?? null,
    baseCurrency: user.baseCurrency,
    kycTier: user.kycTier,
    kycLimit: toAmount(user.kycLimitCents),
    isActive: user.isActive,
    createdAt: user.createdAt?.toISOString(),
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    accountId,
    counts: {
      transactions: at(counts.transactions),
      budgets: at(counts.budgets),
      milestones: at(counts.milestones),
      rails: at(counts.rails),
    },
  };
}

function stack(rows) {
  return rows.reduce((all, row) => all + row.count, 0);
}

export const adminService = {
  async overview({ window = "30d" } = {}) {
    const days = WINDOWS[window] ?? WINDOWS["30d"];
    const since = windowStart(days);
    const windowFilter = { createdAt: { $gte: since } };

    const [
      totalUsers,
      activeUserCount,
      suspendedUsers,
      adminCount,
      newUsers,
      totalAccounts,
      totalTransactions,
      transactionsInWindow,
      activeAccounts,
      budgetCount,
      milestoneCount,
      auditEvents,
      providerRows,
      kycRows,
      typeRows,
      railRows,
      categoryDocs,
      categoryRows,
      userSeries,
      transactionSeries,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: false }),
      User.countDocuments({ role: "admin" }),
      User.countDocuments(windowFilter),
      Account.countDocuments(),
      Transaction.countDocuments(),
      Transaction.countDocuments(windowFilter),
      Transaction.aggregate([
        { $match: windowFilter },
        { $group: { _id: "$accountId" } },
        { $count: "count" },
      ]),
      Budget.countDocuments(),
      Milestone.countDocuments(),
      AuditLog.countDocuments(windowFilter),
      User.aggregate([{ $group: { _id: "$provider", count: { $sum: 1 } } }]),
      User.aggregate([{ $group: { _id: "$kycTier", count: { $sum: 1 } } }]),
      Transaction.aggregate([
        { $match: windowFilter },
        { $group: { _id: "$type", count: { $sum: 1 } } },
      ]),
      Rail.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Category.find({}).select("key label").lean(),
      Transaction.aggregate([
        { $match: windowFilter },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 },
      ]),
      dailySeries(User, windowFilter, days),
      dailySeries(Transaction, windowFilter, days),
    ]);

    const labels = new Map(categoryDocs.map((doc) => [doc.key, doc.label]));
    const typeCount = (type) => typeRows.find((row) => row._id === type)?.count ?? 0;

    return {
      window: { key: window, days, since: since.toISOString() },
      users: {
        total: totalUsers,
        active: activeUserCount,
        suspended: suspendedUsers,
        admins: adminCount,
        newInWindow: newUsers,
      },
      accounts: {
        total: totalAccounts,
        activeInWindow: activeAccounts[0]?.count ?? 0,
      },
      ledger: {
        transactions: totalTransactions,
        inWindow: transactionsInWindow,
        byType: { income: typeCount("income"), expense: typeCount("expense") },
        topCategories: categoryRows.map((row) => ({
          key: row._id,
          label: labels.get(row._id) ?? row._id,
          count: row.count,
        })),
      },
      resources: {
        budgets: budgetCount,
        milestones: milestoneCount,
        rails: {
          total: stack(railRows),
          byStatus: railRows.map((row) => ({ status: row._id, count: row.count })),
        },
      },
      categories: { total: categoryDocs.length },
      audit: { eventsInWindow: auditEvents },
      composition: {
        byProvider: providerRows.map((row) => ({ key: row._id, count: row.count })),
        byKycTier: kycRows
          .map((row) => ({ tier: row._id, count: row.count }))
          .sort((a, b) => a.tier - b.tier),
      },
      activity: userSeries.map((point, index) => ({
        date: point.date,
        users: point.count,
        transactions: transactionSeries[index]?.count ?? 0,
      })),
      system: {
        db: dbState(),
        uptimeSeconds: Math.round(process.uptime()),
        memoryMb: Math.round(process.memoryUsage().rss / (1024 * 1024)),
        node: process.version,
        env: process.env.NODE_ENV ?? "development",
      },
    };
  },

  async analytics({ granularity = "day", window = "30d" } = {}) {
    const days = window === "90d" ? 90 : 30;
    const since = windowStart(days);
    const unit = granularity === "week" ? "week" : "day";
    const bucket = { $dateTrunc: { date: "$createdAt", unit, timezone: "UTC" } };

    const [txRows, userRows, categoryRows, categoryDocs] = await Promise.all([
      Transaction.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: { bucket, type: "$type" }, count: { $sum: 1 } } },
      ]),
      User.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: bucket, count: { $sum: 1 } } },
      ]),
      Transaction.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),
      Category.find({}).select("key label").lean(),
    ]);

    const keyOf = (value) => new Date(value).toISOString().slice(0, 10);
    const txMap = new Map();
    for (const row of txRows) {
      const key = keyOf(row._id.bucket);
      const entry = txMap.get(key) ?? { income: 0, expense: 0 };
      entry[row._id.type] = row.count;
      txMap.set(key, entry);
    }
    const signupMap = new Map(userRows.map((row) => [keyOf(row._id), row.count]));

    const start =
      unit === "week"
        ? new Date(startOfUtcDay(since) - ((new Date(since).getUTCDay() + 6) % 7) * DAY_MS)
        : new Date(since);
    const step = (unit === "week" ? 7 : 1) * DAY_MS;
    const now = startOfUtcDay(new Date());
    const buckets = [];
    for (let cursor = start.getTime(); cursor <= now; cursor += step) {
      buckets.push(keyOf(cursor));
    }

    const labels = new Map(categoryDocs.map((doc) => [doc.key, doc.label]));
    const series = buckets.map((date) => {
      const entry = txMap.get(date);
      return {
        date,
        signups: signupMap.get(date) ?? 0,
        income: entry?.income ?? 0,
        expense: entry?.expense ?? 0,
      };
    });
    const totals = series.reduce(
      (all, point) => ({
        usersNew: all.usersNew + point.signups,
        posts: all.posts + point.income + point.expense,
        income: all.income + point.income,
        expense: all.expense + point.expense,
      }),
      { usersNew: 0, posts: 0, income: 0, expense: 0 },
    );

    return {
      window: { key: window, days, since: since.toISOString() },
      granularity,
      series,
      totals,
      categories: categoryRows.map((row) => ({
        key: row._id,
        label: labels.get(row._id) ?? row._id,
        count: row.count,
      })),
    };
  },

  async listUsers({ search, status, role, kycTier, page = 1, limit = 20, sort = "newest" } = {}) {
    const filter = {};
    if (search) {
      const pattern = escapeRegex(search);
      filter.$or = [
        { name: { $regex: pattern, $options: "i" } },
        { email: { $regex: pattern, $options: "i" } },
      ];
    }
    if (status) filter.isActive = status === "active";
    if (role) filter.role = role;
    if (kycTier) filter.kycTier = kycTier;

    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const safePage = Math.max(page, 1);

    const [total, users] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .sort(SORT[sort] ?? SORT.newest)
        .skip((safePage - 1) * safeLimit)
        .limit(safeLimit),
    ]);

    const accounts = await Account.find({ userId: { $in: users.map((user) => user._id) } });
    const accountByUser = new Map(accounts.map((account) => [String(account.userId), account]));
    const counts = await countsForAccounts(accounts.map((account) => account._id));

    return {
      items: users.map((user) =>
        serializeAdminUser(user, accountByUser.get(String(user._id)), counts)
      ),
      page: safePage,
      limit: safeLimit,
      total,
      pages: Math.max(1, Math.ceil(total / safeLimit)),
    };
  },

  async getUser(id) {
    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }
    const user = await User.findById(id);
    if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");

    const account = await Account.findOne({ userId: user._id });
    const counts = account
      ? await countsForAccounts([account._id])
      : { transactions: new Map(), budgets: new Map(), milestones: new Map(), rails: new Map() };
    const audit = await auditService.list({ targetType: "user", targetId: id, limit: 8 });

    return {
      ...serializeAdminUser(user, account, counts),
      audit: audit.items.map(serializeAuditLog),
    };
  },

  async updateUser(actor, id, input, req) {
    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }
    const user = await User.findById(id);
    if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");

    const isSelf = String(user._id) === String(actor.id);
    const activeAdminCount = await User.countDocuments({ role: "admin", isActive: true });
    const isLastActiveAdmin = user.role === "admin" && user.isActive && activeAdminCount <= 1;

    let action;
    let metadata;

    switch (input.action) {
      case "suspend":
        if (isSelf) throw new ApiError(httpStatus.BAD_REQUEST, "You cannot suspend your own account");
        if (isLastActiveAdmin) {
          throw new ApiError(httpStatus.BAD_REQUEST, "At least one active admin is required");
        }
        metadata = { from: user.isActive, to: false };
        user.isActive = false;
        action = "user.suspend";
        break;
      case "reinstate":
        metadata = { from: user.isActive, to: true };
        user.isActive = true;
        action = "user.reinstate";
        break;
      case "role":
        if (isSelf) throw new ApiError(httpStatus.BAD_REQUEST, "You cannot change your own role");
        if (user.role === "admin" && input.role !== "admin" && isLastActiveAdmin) {
          throw new ApiError(httpStatus.BAD_REQUEST, "At least one active admin is required");
        }
        metadata = { from: user.role, to: input.role };
        user.role = input.role;
        action = "user.role_change";
        break;
      case "kycTier":
        metadata = {
          from: user.kycTier,
          to: input.kycTier,
          limitFrom: toAmount(user.kycLimitCents),
          limitTo: toAmount(KYC_TIER_LIMITS_CENTS[input.kycTier]),
        };
        user.kycTier = input.kycTier;
        user.kycLimitCents = KYC_TIER_LIMITS_CENTS[input.kycTier];
        action = "user.kyc_tier_change";
        break;
      default:
        throw new ApiError(httpStatus.BAD_REQUEST, "Unsupported admin action");
    }

    await user.save();
    await auditService.record({
      actor,
      action,
      targetType: "user",
      targetId: String(user._id),
      reason: input.reason,
      metadata,
      req,
    });

    const account = await Account.findOne({ userId: user._id });
    const counts = account
      ? await countsForAccounts([account._id])
      : { transactions: new Map(), budgets: new Map(), milestones: new Map(), rails: new Map() };
    return serializeAdminUser(user, account, counts);
  },
};
