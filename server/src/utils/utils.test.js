import { describe, expect, it } from "vitest";

import { toAmount, toCents } from "./money.js";
import { cycleRange, isValidCycleKey } from "./cycle.js";
import {
  serializeBudget,
  serializeMilestone,
  serializeRail,
  serializeTransaction,
  serializeUser,
} from "./serialize.js";

describe("money", () => {
  it("converts naira to integer cents", () => {
    expect(toCents(12.34)).toBe(1234);
    expect(toCents("10.999")).toBe(1100);
    expect(toCents(0)).toBe(0);
  });

  it("converts cents back to a 2-dp amount", () => {
    expect(toAmount(1234)).toBe(12.34);
    expect(toAmount(0)).toBe(0);
    expect(toAmount(null)).toBe(0);
    expect(toAmount(undefined)).toBe(0);
  });
});

describe("cycle", () => {
  it("builds a half-open [start, end) month range", () => {
    const { start, end } = cycleRange("202610");
    expect(start.getFullYear()).toBe(2026);
    expect(start.getMonth()).toBe(9);
    expect(start.getDate()).toBe(1);
    expect(end.getMonth()).toBe(10);
  });

  it("validates YYYYMM keys", () => {
    expect(isValidCycleKey("202610")).toBe(true);
    expect(isValidCycleKey("2026-10")).toBe(false);
    expect(isValidCycleKey(undefined)).toBe(false);
  });
});

describe("serializers", () => {
  const id = (value) => ({ toString: () => value });

  it("serializes a user with the KYC limit back in naira", () => {
    const user = serializeUser({
      _id: id("u1"),
      name: "Ada",
      email: "ada@example.com",
      provider: "password",
      avatarUrl: null,
      baseCurrency: "NGN",
      kycTier: 1,
      kycLimitCents: 500_000_000,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    });
    expect(user).toMatchObject({ id: "u1", kycLimit: 5_000_000, avatarUrl: null });
    expect(user.createdAt).toBe("2026-01-01T00:00:00.000Z");
  });

  it("serializes a transaction with a decimal amount", () => {
    const txn = serializeTransaction({
      _id: id("t1"),
      type: "expense",
      amountCents: 1500,
      currency: "NGN",
      category: "food",
      description: "Lunch",
      note: "",
      railId: "rail_1",
      railName: "Kuda",
      occurredAt: new Date("2026-10-14T10:00:00.000Z"),
      createdAt: new Date("2026-10-14T10:00:00.000Z"),
    });
    expect(txn.amount).toBe(15);
    expect(txn.railName).toBe("Kuda");
  });

  it("serializes a budget policy back to naira", () => {
    const budget = serializeBudget({
      _id: id("b1"),
      category: "food",
      allocatedCents: 5_000_000,
      currency: "NGN",
      cadence: "monthly",
      isLocked: false,
      policy: { autoSweep: { enabled: false, thresholdCents: 250_00 }, hardLimitPct: 105 },
      createdAt: new Date("2026-10-01T00:00:00.000Z"),
      updatedAt: new Date("2026-10-01T00:00:00.000Z"),
    });
    expect(budget.allocated).toBe(50_000);
    expect(budget.policy.autoSweep.threshold).toBe(250);
  });

  it("omits targetDate on a milestone when unset", () => {
    const base = {
      _id: id("m1"),
      title: "Trip",
      targetAmountCents: 200_000_00,
      savedAmountCents: 0,
      currency: "NGN",
      cadenceCents: 0,
      createdAt: new Date("2026-10-01T00:00:00.000Z"),
    };
    expect(serializeMilestone(base)).not.toHaveProperty("targetDate");
    expect(serializeMilestone({ ...base, targetDate: new Date("2027-01-01T00:00:00.000Z") })).toHaveProperty(
      "targetDate"
    );
  });

  it("omits last4 on a rail when unset", () => {
    const base = {
      _id: id("r1"),
      name: "Cash",
      kind: "cash",
      currency: "NGN",
      latencyMs: 0,
      status: "connected",
    };
    expect(serializeRail(base)).not.toHaveProperty("last4");
    expect(serializeRail({ ...base, last4: "4417" }).last4).toBe("4417");
  });
});
