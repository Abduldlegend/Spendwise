import { describe, expect, it } from "vitest";

import { authValidators } from "./auth.validator.js";
import { transactionValidators } from "./transaction.validator.js";
import { budgetValidators } from "./budget.validator.js";
import { categoryValidators } from "./category.validator.js";
import { milestoneValidators } from "./milestone.validator.js";
import { railValidators } from "./rail.validator.js";
import { profileValidators } from "./profile.validator.js";
import { adminValidators } from "./admin.validator.js";

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

  it("rejects a malformed category key", () => {
    expect(fail(transactionValidators.create, { ...valid, category: "not a key" })).toBe(false);
  });

  it("accepts custom category keys, since the taxonomy is runtime data", () => {
    expect(fail(transactionValidators.create, { ...valid, category: "crypto" })).toBe(true);
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

  it("rejects a malformed category key", () => {
    expect(fail(budgetValidators.create, { ...valid, category: "Not A Key" })).toBe(false);
  });

  it("leaves direction checks to the service, so a custom key passes validation", () => {
    expect(fail(budgetValidators.create, { ...valid, category: "crypto" })).toBe(true);
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

describe("category validator", () => {
  const valid = {
    key: "crypto",
    label: "Crypto",
    icon: "currency_bitcoin",
    accent: "info",
    kind: "expense",
  };

  it("normalizes the key and defaults status and sortOrder", () => {
    const parsed = parse(categoryValidators.create, { ...valid, key: " Crypto " });
    expect(parsed.key).toBe("crypto");
    expect(parsed.status).toBe("enabled");
    expect(parsed.sortOrder).toBe(0);
  });

  it("rejects an unknown accent or direction", () => {
    expect(fail(categoryValidators.create, { ...valid, accent: "rainbow" })).toBe(false);
    expect(fail(categoryValidators.create, { ...valid, kind: "transfer" })).toBe(false);
  });

  it("treats the key as immutable on update", () => {
    const parsed = parse(categoryValidators.update, { label: "Crypto & Web3" });
    expect(parsed.label).toBe("Crypto & Web3");
    expect(parsed).not.toHaveProperty("key");
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

describe("admin validator", () => {
  it("defaults the overview window and rejects unknown windows", () => {
    expect(adminValidators.overview.query.parse({}).window).toBe("30d");
    expect(adminValidators.overview.query.safeParse({ window: "1y" }).success).toBe(false);
  });

  it("defaults user directory pagination and sorting", () => {
    const parsed = adminValidators.listUsers.query.parse({});
    expect(parsed).toMatchObject({ page: 1, limit: 20, sort: "newest" });
  });

  it("requires a written reason for every user action", () => {
    expect(fail(adminValidators.updateUser, { action: "suspend", reason: "  " })).toBe(false);
    expect(
      parse(adminValidators.updateUser, { action: "suspend", reason: "Fraud report 441" }).reason
    ).toBe("Fraud report 441");
  });

  it("requires the target role or tier for the matching action", () => {
    expect(fail(adminValidators.updateUser, { action: "role", reason: "Team change" })).toBe(false);
    expect(
      parse(adminValidators.updateUser, { action: "role", role: "admin", reason: "Team change" }).role
    ).toBe("admin");
    expect(fail(adminValidators.updateUser, { action: "kycTier", reason: "Verified docs" })).toBe(false);
  });

  it("requires a reason for taxonomy and credential changes", () => {
    const category = {
      key: "crypto",
      label: "Crypto",
      icon: "currency_bitcoin",
      accent: "info",
      kind: "expense",
    };
    expect(fail(adminValidators.createCategory, category)).toBe(false);
    expect(
      parse(adminValidators.createCategory, { ...category, reason: "New product line" }).reason
    ).toBe("New product line");
    expect(fail(adminValidators.rotateCredential, { reason: "" })).toBe(false);
  });

  it("validates audit pagination defaults", () => {
    expect(adminValidators.listAudit.query.parse({})).toMatchObject({ page: 1, limit: 50 });
  });
});
