import { describe, it, expect } from "vitest";
import {
  evaluateBudget,
  periodStartUtc,
  periodElapsedRatio,
  type BudgetInput,
  type SpendSnapshot,
} from "./budgets";

const base: BudgetInput = {
  amountUsd: 100,
  warningThresholdPct: 80,
  criticalThresholdPct: 100,
  forecastEnabled: true,
};

function snap(spendUsd: number): SpendSnapshot {
  return { spendUsd, unpricedCount: 0, eventCount: 1 };
}

describe("evaluateBudget thresholds", () => {
  it("stays ok below warning", () => {
    // 79.9 at 90% elapsed forecasts 88.8 — under budget, so nothing fires.
    const r = evaluateBudget(base, snap(79.9), 0.9, new Set());
    expect(r.state).toBe("ok");
    expect(r.percentUsed).toBeCloseTo(79.9);
    expect(r.forecastUsd).toBeCloseTo(88.78, 1);
    expect(r.newlyBreached).toEqual([]);
  });

  it("breaches warning at exactly the threshold", () => {
    const r = evaluateBudget(base, snap(80), 0.9, new Set());
    expect(r.state).toBe("warning");
    expect(r.newlyBreached).toEqual(["warning"]);
  });

  it("fires warning, critical, and forecast together past all three", () => {
    // Spend over budget always projects over budget (forecast >= spend
    // whenever elapsed <= 1), so a critical breach implies a forecast
    // breach too. Both are recorded so history stays complete.
    const r = evaluateBudget(base, snap(120), 0.9, new Set());
    expect(r.state).toBe("critical");
    expect(r.newlyBreached).toEqual(["warning", "critical", "forecast"]);
  });

  it("does not refire already-fired thresholds", () => {
    const r = evaluateBudget(base, snap(120), 0.5, new Set(["warning", "critical"]));
    expect(r.newlyBreached).toEqual(["forecast"]);
    expect(r.state).toBe("critical");
  });

  it("guards zero and negative amounts", () => {
    const r = evaluateBudget({ ...base, amountUsd: 0 }, snap(50), 0.5, new Set());
    expect(r.percentUsed).toBe(0);
    expect(r.state).toBe("ok");
    expect(r.forecastOver).toBe(false);
  });
});

describe("evaluateBudget forecast", () => {
  it("returns null forecast at period start (no divide by zero)", () => {
    const r = evaluateBudget(base, snap(10), 0, new Set());
    expect(r.forecastUsd).toBeNull();
    expect(r.forecastOver).toBe(false);
    expect(JSON.stringify(r)).not.toContain("Infinity");
    expect(JSON.stringify(r)).not.toContain("NaN");
  });

  it("projects linearly and flags overage", () => {
    // $60 at halfway -> $120 projected vs $100 budget
    const r = evaluateBudget(base, snap(60), 0.5, new Set());
    expect(r.forecastUsd).toBeCloseTo(120);
    expect(r.forecastOver).toBe(true);
    expect(r.newlyBreached).toContain("forecast");
  });

  it("respects forecastEnabled=false", () => {
    const r = evaluateBudget({ ...base, forecastEnabled: false }, snap(60), 0.5, new Set());
    expect(r.forecastUsd).toBeNull();
    expect(r.newlyBreached).not.toContain("forecast");
  });
});

describe("period boundaries (UTC)", () => {
  it("daily starts at UTC midnight", () => {
    const start = periodStartUtc(new Date("2026-03-15T18:30:00Z"), "daily");
    expect(start.toISOString()).toBe("2026-03-15T00:00:00.000Z");
  });

  it("weekly is a rolling 7 days", () => {
    const now = new Date("2026-03-15T12:00:00Z");
    const start = periodStartUtc(now, "weekly");
    expect(start.toISOString()).toBe("2026-03-08T12:00:00.000Z");
  });

  it("monthly starts on the 1st UTC (handles short months)", () => {
    const start = periodStartUtc(new Date("2026-02-20T10:00:00Z"), "monthly");
    expect(start.toISOString()).toBe("2026-02-01T00:00:00.000Z");
  });

  it("elapsed ratio stays within [0, 1]", () => {
    const r = periodElapsedRatio(new Date("2026-03-15T12:00:00Z"), "daily");
    expect(r).toBeCloseTo(0.5);
    expect(periodElapsedRatio(new Date("2026-03-15T00:00:00Z"), "daily")).toBe(0);
  });
});
