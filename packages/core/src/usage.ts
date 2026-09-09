/**
 * Read-side usage aggregation. Pure functions (unit-testable) + a shared
 * tenant scope. All dashboard/costs/budgets reads go through here so the
 * data source and tenant filter stay consistent. Cost means priced spend;
 * unpriced events (calculatedCost === null) count toward event totals but
 * contribute zero cost.
 */
import { roundMoney } from "./pricing";

export interface UsageEventLike {
  provider: string;
  model: string | null;
  agentId: string | null;
  inputTokens: number;
  outputTokens: number;
  calculatedCost: number | null;
  timestamp: Date;
}

export interface TimeSeriesPoint {
  date: string;
  cost: number;
  events: number;
}

export interface AgentSummaryLike {
  id: string;
  name: string;
  description: string | null;
  projectId: string | null;
  totalCost: number;
  eventCount: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  lastActivity: string | null;
  costByProvider: Record<string, number>;
}

export function sumSpend(events: UsageEventLike[]): number {
  return roundMoney(events.reduce((sum, e) => sum + (e.calculatedCost ?? 0), 0));
}

export function tokenTotals(events: UsageEventLike[]): { input: number; output: number } {
  let input = 0;
  let output = 0;
  for (const e of events) {
    input += e.inputTokens;
    output += e.outputTokens;
  }
  return { input, output };
}

export function buildTimeSeries(
  events: UsageEventLike[],
  groupBy: "day" | "hour" = "day"
): TimeSeriesPoint[] {
  const map = new Map<string, { cost: number; events: number }>();
  for (const e of events) {
    const key =
      groupBy === "hour" ? e.timestamp.toISOString().slice(0, 13) : e.timestamp.toISOString().split("T")[0];
    const entry = map.get(key) ?? { cost: 0, events: 0 };
    entry.cost += e.calculatedCost ?? 0;
    entry.events += 1;
    map.set(key, entry);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({ date, cost: roundMoney(data.cost), events: data.events }));
}

export function buildProviderBreakdown(events: UsageEventLike[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const e of events) {
    out[e.provider] = roundMoney((out[e.provider] ?? 0) + (e.calculatedCost ?? 0));
  }
  return out;
}

export function buildModelBreakdown(events: UsageEventLike[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const e of events) {
    if (!e.model) continue;
    out[e.model] = roundMoney((out[e.model] ?? 0) + (e.calculatedCost ?? 0));
  }
  return out;
}

export function buildAgentBreakdown(events: UsageEventLike[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const e of events) {
    const key = e.agentId ?? "unattributed";
    out[key] = roundMoney((out[key] ?? 0) + (e.calculatedCost ?? 0));
  }
  return out;
}

/** Build per-agent summaries for the "Top Agents" table. */
export function buildAgentSummaries(events: UsageEventLike[]): AgentSummaryLike[] {
  const byAgent = new Map<
    string,
    {
      totalCost: number;
      eventCount: number;
      totalInputTokens: number;
      totalOutputTokens: number;
      lastActivity: Date | null;
      costByProvider: Record<string, number>;
    }
  >();

  for (const e of events) {
    const key = e.agentId ?? "unattributed";
    const entry =
      byAgent.get(key) ??
      { totalCost: 0, eventCount: 0, totalInputTokens: 0, totalOutputTokens: 0, lastActivity: null, costByProvider: {} };
    entry.totalCost += e.calculatedCost ?? 0;
    entry.eventCount += 1;
    entry.totalInputTokens += e.inputTokens;
    entry.totalOutputTokens += e.outputTokens;
    entry.costByProvider[e.provider] = roundMoney(
      (entry.costByProvider[e.provider] ?? 0) + (e.calculatedCost ?? 0)
    );
    if (!entry.lastActivity || e.timestamp.getTime() > entry.lastActivity.getTime()) {
      entry.lastActivity = e.timestamp;
    }
    byAgent.set(key, entry);
  }

  return Array.from(byAgent.entries())
    .map(([id, v]) => ({
      id,
      name: id === "unattributed" ? "Unattributed" : id,
      description: null,
      projectId: null,
      totalCost: roundMoney(v.totalCost),
      eventCount: v.eventCount,
      totalInputTokens: v.totalInputTokens,
      totalOutputTokens: v.totalOutputTokens,
      lastActivity: v.lastActivity?.toISOString() ?? null,
      costByProvider: v.costByProvider,
    }))
    .sort((a, b) => b.totalCost - a.totalCost);
}

/** Tenant + lifecycle filter shared by every usage_events read. */
export function usageScope(organizationId: string) {
  return { organizationId, lifecycle: "active" as const };
}
