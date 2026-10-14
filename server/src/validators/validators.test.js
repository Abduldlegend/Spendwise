import { describe, expect, it } from "vitest";

import { authValidators } from "./auth.validator.js";
import { transactionValidators } from "./transaction.validator.js";
import { budgetValidators } from "./budget.validator.js";
import { milestoneValidators } from "./milestone.validator.js";
import { railValidators } from "./rail.validator.js";
import { profileValidators } from "./profile.validator.js";

function parse(schema, value) {
  return schema.body.parse(value);
}

function fail(schema, value) {
  return schema.body.safeParse(value).success;
}

describe("transaction validator", () => {
  const valid = {
    type: "expense",
    amount: 1500.5,
    category: "food",
    description: "Lunch at the canteen",
    railId: "rail_1",
    occurredAt: "2026-10-14T10:00:00.000Z",
  };

  it("accepts a valid transaction and defaults the currency", () => {
    const parsed = parse(transactionValidators.create, valid);
    expect(parsed.currency).toBe("NGN");
    expect(parsed.occurredAt).toBeInstanceOf(Date);
  });

  it("derives the sign from type, so the amount must stay positive", () => {
    expect(fail(transactionValidators.create, { ...valid, amount: -10 })).toBe(false);
  });

  it("rejects more than two decimal places", () => {
    expect(fail(transactionValidators.create, { ...valid, amount: 10.555 })).toBe(false);
  });

  it("rejects an unknown category", () => {
    expect(fail(transactionValidators.create, { ...valid, category: "crypto" })).toBe(false);
  });

  it("validates the cycle query as YYYYMM", () => {
    expect(transactionValidators.list.query.safeParse({ cycle: "202610" }).success).toBe(true);
    expect(transactionValidators.list.query.safeParse({ cycle: "2026-10" }).success).toBe(false);
  });
});

describe("auth validator", () => {
  it("accepts fullName as the name field", () => {
    const parsed = parse(authValidators.register, {
      fullName: "Ada Obi",
      email: "ada@example.com",
      password: "password123",
    });
    expect(parsed.fullName).toBe("Ada Obi");
  });

  it("requires a name, a valid email and an 8+ char password", () => {
    expect(fail(authValidators.register, { email: "a@b.com", password: "password123" })).toBe(false);
    expect(fail(authValidators.register, { fullName: "Ada", email: "nope", password: "password123" })).toBe(false);
    expect(fail(authValidators.register, { fullName: "Ada", email: "a@b.com", password: "short" })).toBe(false);
  });

  it("requires a Google credential", () => {
    expect(fail(authValidators.google, {})).toBe(false);
    expect(parse(authValidators.google, { credential: "abc" }).credential).toBe("abc");
  });
});

describe("budget validator", () => {
  const valid = { category: "food", allocated: 50000 };

  it("accepts a valid envelope with policy defaults", () => {
    const parsed = parse(budgetValidators.create, valid);
    expect(parsed.cadence).toBe("monthly");
    expect(parsed.policy.hardLimitPct).toBe(105);
    expect(parsed.policy.autoSweep.enabled).toBe(false);
  });

  it("never allows an income envelope", () => {
    expect(fail(budgetValidators.create, { ...valid, category: "income" })).toBe(false);
  });

  it("refuses a locked envelope that auto-sweeps", () => {
    const value = {
      ...valid,
      isLocked: true,
      policy: { autoSweep: { enabled: true, threshold: 0 }, hardLimitPct: 105 },
    };
    expect(fail(budgetValidators.create, value)).toBe(false);
  });
});

describe("milestone validator", () => {
  const valid = { title: "Emergency fund", targetAmount: 200000 };

  it("defaults savedAmount and cadence to zero", () => {
    const parsed = parse(milestoneValidators.create, valid);
    expect(parsed.savedAmount).toBe(0);
    expect(parsed.cadence).toBe(0);
  });

  it("treats an empty targetDate as absent", () => {
    const parsed = parse(milestoneValidators.create, { ...valid, targetDate: "" });
    expect(parsed.targetDate).toBeUndefined();
  });

  it("rejects a negative target", () => {
    expect(fail(milestoneValidators.create, { ...valid, targetAmount: -1 })).toBe(false);
  });
});

describe("rail validator", () => {
  const valid = { name: "Kuda MFB", kind: "digital" };

  it("defaults currency, latency and status", () => {
    const parsed = parse(railValidators.create, valid);
    expect(parsed.currency).toBe("NGN");
    expect(parsed.latencyMs).toBe(0);
    expect(parsed.status).toBe("connected");
  });

  it("treats an empty last4 as absent", () => {
    expect(parse(railValidators.create, { ...valid, last4: "" }).last4).toBeUndefined();
  });

  it("rejects a malformed last4", () => {
    expect(fail(railValidators.create, { ...valid, last4: "44" })).toBe(false);
  });

  it("rejects an unknown kind", () => {
    expect(fail(railValidators.create, { ...valid, kind: "crypto" })).toBe(false);
  });
});

describe("profile validator", () => {
  it("accepts a partial patch", () => {
    expect(parse(profileValidators.update, { name: "Ada Obi" }).name).toBe("Ada Obi");
  });

  it("bounds the KYC tier to 1-3", () => {
    expect(fail(profileValidators.update, { kycTier: 9 })).toBe(false);
  });
});
