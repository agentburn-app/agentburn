import { describe, it, expect } from "vitest";
import {
  computeCost,
  explainCost,
  resolveVersionAt,
  roundMoney,
  type PricedVersion,
  type TokenUsage,
} from "./pricing";

const rates = {
  inputPrice: 2.5,
  outputPrice: 10.0,
  cachedInputPrice: 0.625,
  reasoningPrice: 1.25,
};

const provenance = { provider: "openai", model: "gpt-4o" };

function usage(partial: Partial<TokenUsage>): TokenUsage {
  return {
    inputTokens: 0,
    outputTokens: 0,
    cachedInputTokens: 0,
    reasoningTokens: 0,
    ...partial,
  };
}

describe("computeCost", () => {
  it("computes a simple input+output cost", () => {
    const b = computeCost(
      usage({ inputTokens: 1_000_000, outputTokens: 500_000 }),
      rates,
      provenance
    );
    expect(b.total).toBeCloseTo(7.5); // 1M×2.5 + 0.5M×10
    expect(b.lines).toHaveLength(2);
    expect(b.lines.map((l) => l.category)).toEqual(["input", "output"]);
  });

  it("prices cached and reasoning tokens at their own rates", () => {
    const b = computeCost(
      usage({ inputTokens: 0, cachedInputTokens: 2_000_000, reasoningTokens: 1_000_000 }),
      rates,
      provenance
    );
    // 2M×0.625 + 1M×1.25
    expect(b.total).toBeCloseTo(1.25 + 1.25);
    expect(b.lines.map((l) => l.category)).toEqual(["cached_input", "reasoning"]);
  });

  it("omits categories with no configured rate", () => {
    const b = computeCost(
      usage({ inputTokens: 100, reasoningTokens: 100 }),
      { inputPrice: 2.5, outputPrice: 10 },
      provenance
    );
    expect(b.lines).toHaveLength(1);
    expect(b.lines[0].category).toBe("input");
  });

  it("is deterministic", () => {
    const u = usage({ inputTokens: 1234567, outputTokens: 654321, cachedInputTokens: 77 });
    const a = computeCost(u, rates, provenance);
    const b = computeCost(u, rates, provenance);
    expect(a).toEqual(b);
  });

  it("returns zero for zero usage", () => {
    const b = computeCost(usage({}), rates, provenance);
    expect(b.total).toBe(0);
    expect(b.lines).toHaveLength(0);
  });
});

describe("roundMoney", () => {
  it("rounds to sub-cent without drift", () => {
    expect(roundMoney(0.1 + 0.2)).toBe(0.3);
    expect(roundMoney(1.23456789)).toBe(1.2346);
  });
});

describe("resolveVersionAt", () => {
  const base: Omit<PricedVersion, "effectiveFrom" | "effectiveTo" | "verificationStatus" | "verifiedAt"> = {
    id: "v",
    inputPrice: 1,
    outputPrice: 1,
    cachedInputPrice: null,
    reasoningPrice: null,
    sourceUrl: "https://example",
  };
  const at = (iso: string) => new Date(iso);

  it("picks the version covering the timestamp (inclusive start, exclusive end)", () => {
    const versions: PricedVersion[] = [
      {
        ...base,
        id: "v1",
        effectiveFrom: at("2026-01-01T00:00:00Z"),
        effectiveTo: at("2026-02-01T00:00:00Z"),
        verificationStatus: "verified",
        verifiedAt: at("2026-01-02T00:00:00Z"),
      },
      {
        ...base,
        id: "v2",
        effectiveFrom: at("2026-02-01T00:00:00Z"),
        effectiveTo: null,
        verificationStatus: "verified",
        verifiedAt: at("2026-02-02T00:00:00Z"),
      },
    ];
    expect(resolveVersionAt(versions, at("2026-01-15T00:00:00Z"))?.id).toBe("v1");
    expect(resolveVersionAt(versions, at("2026-02-15T00:00:00Z"))?.id).toBe("v2");
    // boundary: end is exclusive
    expect(resolveVersionAt(versions, at("2026-02-01T00:00:00Z"))?.id).toBe("v2");
  });

  it("returns null when no version covers the timestamp", () => {
    const versions: PricedVersion[] = [
      {
        ...base,
        effectiveFrom: at("2026-01-01T00:00:00Z"),
        effectiveTo: at("2026-01-31T00:00:00Z"),
        verificationStatus: "verified",
        verifiedAt: null,
      },
    ];
    expect(resolveVersionAt(versions, at("2026-02-15T00:00:00Z"))).toBeNull();
  });

  it("prefers verified over pending when both cover the window", () => {
    const versions: PricedVersion[] = [
      {
        ...base,
        id: "pending",
        effectiveFrom: at("2026-01-01T00:00:00Z"),
        effectiveTo: null,
        verificationStatus: "pending",
        verifiedAt: null,
      },
      {
        ...base,
        id: "verified",
        effectiveFrom: at("2026-01-01T00:00:00Z"),
        effectiveTo: null,
        verificationStatus: "verified",
        verifiedAt: at("2026-01-02T00:00:00Z"),
      },
    ];
    expect(resolveVersionAt(versions, at("2026-01-15T00:00:00Z"))?.id).toBe("verified");
  });
});

describe("explainCost", () => {
  it("renders the full provenance chain", () => {
    const b = computeCost(
      usage({ inputTokens: 1_200_000, outputTokens: 42_000 }),
      rates,
      {
        provider: "openai",
        model: "gpt-4o",
        pricingVersionId: "v2026-08-14",
        sourceUrl: "https://openai.com/pricing",
        verifiedAt: "2026-08-15",
      }
    );
    const s = explainCost(b);
    expect(s).toContain("openai → gpt-4o");
    expect(s).toContain("version v2026-08-14");
    expect(s).toContain("1.2M input");
    expect(s).toContain("42K output");
    expect(s).toContain("= $");
  });

  it("degrades gracefully with no priced categories", () => {
    const b = computeCost(usage({}), rates, provenance);
    expect(explainCost(b)).toContain("no priced categories");
  });
});
