import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get("agentId");
    const provider = searchParams.get("provider");
    const operation = searchParams.get("operation");
    const days = parseInt(searchParams.get("days") ?? "30", 10);
    const groupBy = searchParams.get("groupBy") ?? "day";

    const since = new Date();
    since.setDate(since.getDate() - days);

    const where: Record<string, unknown> = { timestamp: { gte: since } };
    if (agentId) where.agentId = agentId;
    if (provider) where.provider = provider;
    if (operation) where.operation = operation;

    const events = await prisma.costEvent.findMany({
      where,
      include: { agent: { select: { name: true } } },
      orderBy: { timestamp: "desc" },
    });

    let totalCost = 0;
    let totalInput = 0;
    let totalOutput = 0;
    const byProvider: Record<string, number> = {};
    const byOperation: Record<string, number> = {};
    const byModel: Record<string, number> = {};
    const byAgent: Record<string, number> = {};
    const timeMap = new Map<string, { cost: number; events: number }>();

    for (const evt of events) {
      totalCost += evt.costUsd;
      totalInput += evt.inputTokens ?? 0;
      totalOutput += evt.outputTokens ?? 0;
      byProvider[evt.provider] = (byProvider[evt.provider] ?? 0) + evt.costUsd;
      byOperation[evt.operation] = (byOperation[evt.operation] ?? 0) + evt.costUsd;
      if (evt.model) byModel[evt.model] = (byModel[evt.model] ?? 0) + evt.costUsd;

      const agentName = evt.agent?.name ?? evt.agentId;
      byAgent[agentName] = (byAgent[agentName] ?? 0) + evt.costUsd;

      let dateKey: string;
      if (groupBy === "hour") {
        dateKey = evt.timestamp.toISOString().slice(0, 13);
      } else {
        dateKey = evt.timestamp.toISOString().split("T")[0];
      }
      const entry = timeMap.get(dateKey) ?? { cost: 0, events: 0 };
      entry.cost += evt.costUsd;
      entry.events += 1;
      timeMap.set(dateKey, entry);
    }

    const timeSeries = Array.from(timeMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date,
        cost: Math.round(data.cost * 10000) / 10000,
        events: data.events,
      }));

    return NextResponse.json({
      totalCost,
      totalInputTokens: totalInput,
      totalOutputTokens: totalOutput,
      eventCount: events.length,
      byProvider,
      byOperation,
      byModel,
      byAgent,
      timeSeries,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
