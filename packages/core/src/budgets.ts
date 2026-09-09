export type BudgetPeriod = "daily" | "weekly" | "monthly";
export type ThresholdType = "warning" | "critical" | "forecast";
export type BudgetState = "ok" | "warning" | "critical";

export interface BudgetInput {
  amountUsd: number;
  warningThresholdPct: number;
  criticalThresholdPct: number;
  forecastEnabled: boolean;
}

export interface SpendSnapshot {
  spendUsd: number;
  unpricedCount: number;
  eventCount: number;
}

export interface EvaluationResult {
  percentUsed: number;
  state: BudgetState;
  forecastUsd: number | null;
  forecastOver: boolean;
  /** Thresholds breached now that were not already fired. */
  newlyBreached: ThresholdType[];
}

export const THRESHOLD_ORDER: ThresholdType[] = ["warning", "critical", "forecast"];

/** UTC start of the current period containing `now`. */
export function periodStartUtc(now: Date, period: BudgetPeriod): Date {
  const d = new Date(now.getTime());
  if (period === "daily") {
    d.setUTCHours(0, 0, 0, 0);
    return d;
  }
  if (period === "weekly") {
    return new Date(d.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
  // monthly: first of the current UTC month
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

/** Fraction of the current period elapsed, in [0, 1]. */
export function periodElapsedRatio(now: Date, period: BudgetPeriod): number {
  const start = periodStartUtc(now, period).getTime();
  const totalMs =
    period === "daily"
      ? 24 * 60 * 60 * 1000
      : period === "weekly"
        ? 7 * 24 * 60 * 60 * 1000
        : new Date(
            Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)
          ).getTime() -
          new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).getTime();
  if (totalMs <= 0) return 1;
  const elapsed = now.getTime() - start;
  return Math.min(1, Math.max(0, elapsed / totalMs));
}

/**
 * Pure evaluation: given a budget, current-period spend, how far through
 * the period we are, and which thresholds already fired this period,
 * determine state and newly breached thresholds.
 */
export function evaluateBudget(
  input: BudgetInput,
  snapshot: SpendSnapshot,
  elapsedRatio: number,
  alreadyFired: Set<ThresholdType>
): EvaluationResult {
  const percentUsed =
    input.amountUsd > 0 ? (snapshot.spendUsd / input.amountUsd) * 100 : 0;

  let state: BudgetState = "ok";
  if (percentUsed >= input.criticalThresholdPct) state = "critical";
  else if (percentUsed >= input.warningThresholdPct) state = "warning";

  const forecastUsd =
    input.forecastEnabled && elapsedRatio > 0
      ? snapshot.spendUsd / elapsedRatio
      : null;
  const forecastOver =
    forecastUsd !== null && input.amountUsd > 0 && forecastUsd > input.amountUsd;

  const breachedNow = new Set<ThresholdType>();
  if (percentUsed >= input.warningThresholdPct) breachedNow.add("warning");
  if (percentUsed >= input.criticalThresholdPct) breachedNow.add("critical");
  if (forecastOver) breachedNow.add("forecast");

  const newlyBreached = THRESHOLD_ORDER.filter(
    (t) => breachedNow.has(t) && !alreadyFired.has(t)
  );

  return { percentUsed, state, forecastUsd, forecastOver, newlyBreached };
}
