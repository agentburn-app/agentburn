import { describe, it, expect } from "vitest";
import {
  buildAgentBreakdown,
  buildAgentSummaries,
  buildModelBreakdown,
  buildProviderBreakdown,
  buildTimeSeries,
  sumSpend,
  tokenTotals,
  type UsageEventLike,
} from "./usage";

function evt(partial: Partial<UsageEventLike>): UsageEventLike {
  return {
    provider: "openai",
    model: "gpt-4o",
    agentId: "agent-1",
    inputTokens: 0,
    outputTokens: 0,
    calculatedCost: null,
    timestamp: new Date("2026-03-15T12:00:00Z"),
    ...partial,
  };
}

describe("sumSpend", () => {
  it("sums priced spend and ignores unpriced", () => {
    const events = [
      evt({ calculatedCost: 1.5 }),
      evt({ calculatedCost: null }),
      evt({ calculatedCost: 2.25 }),
    ];
    expect(sumSpend(events)).toBe(3.75);
  });
});

describe("tokenTotals", () => {
  it("sums input and output independently", () => {
    const events = [
      evt({ inputTokens: 100, outputTokens: 10 }),
      evt({ inputTokens: 50, outputTokens: 25 }),
    ];
    expect(tokenTotals(events)).toEqual({ input: 150, output: 35 });
  });
});

describe("buildTimeSeries", () => {
  it("buckets by day and sorts ascending", () => {
    const events = [
      evt({ timestamp: new Date("2026-03-15T10:00:00Z"), calculatedCost: 1 }),
      evt({ timestamp: new Date("2026-03-15T11:00:00Z"), calculatedCost: 2 }),
      evt({ timestamp: new Date("2026-03-14T09:00:00Z"), calculatedCost: 5 }),
    ];
    const ts = buildTimeSeries(events, "day");
    expect(ts.map((p) => p.date)).toEqual(["2026-03-14", "2026-03-15"]);
    expect(ts[1].cost).toBe(3);
    expect(ts[1].events).toBe(2);
  });

  it("buckets by hour when asked", () => {
    const events = [
      evt({ timestamp: new Date("2026-03-15T10:30:00Z"), calculatedCost: 4 }),
    ];
    const ts = buildTimeSeries(events, "hour");
    expect(ts[0].date).toBe("2026-03-15T10");
  });
});

describe("breakdowns", () => {
  it("builds provider/model/agent breakdowns", () => {
    const events = [
      evt({ provider: "openai", model: "gpt-4o", agentId: "a", calculatedCost: 1 }),
      evt({ provider: "anthropic", model: "claude", agentId: "a", calculatedCost: 2 }),
      evt({ provider: "openai", model: "gpt-4o", agentId: "b", calculatedCost: 3 }),
    ];
    expect(buildProviderBreakdown(events)).toEqual({ openai: 4, anthropic: 2 });
    expect(buildModelBreakdown(events)).toEqual({ "gpt-4o": 4, claude: 2 });
    expect(buildAgentBreakdown(events)).toEqual({ a: 3, b: 3 });
  });

  it("skips null model in model breakdown", () => {
    const events = [evt({ model: null, calculatedCost: 1 })];
    expect(buildModelBreakdown(events)).toEqual({});
  });

  it("groups null agentId as unattributed", () => {
    const events = [evt({ agentId: null, calculatedCost: 7 })];
    expect(buildAgentBreakdown(events)).toEqual({ unattributed: 7 });
  });
});

describe("buildAgentSummaries", () => {
  it("aggregates and sorts by cost desc", () => {
    const events = [
      evt({ agentId: "a", calculatedCost: 1, inputTokens: 10, outputTokens: 5 }),
      evt({ agentId: "b", calculatedCost: 9 }),
      evt({ agentId: "a", calculatedCost: 2 }),
    ];
    const summaries = buildAgentSummaries(events);
    expect(summaries.map((s) => s.id)).toEqual(["b", "a"]);
    const a = summaries.find((s) => s.id === "a")!;
    expect(a.totalCost).toBe(3);
    expect(a.eventCount).toBe(2);
    expect(a.totalInputTokens).toBe(10);
    expect(a.costByProvider).toEqual({ openai: 3 });
  });
});
