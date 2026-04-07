import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { percentChange } from "@/lib/utils";
import type { DashboardData, TimeSeriesPoint, BudgetAlertStatus } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(todayStart);
    monthStart.setDate(monthStart.getDate() - 30);
    const prevMonthStart = new Date(monthStart);
    prevMonthStart.setDate(prevMonthStart.getDate() - 30);

    const [todayEvents, weekEvents, monthEvents, prevMonthEvents, allAgents, budgetAlerts] =
      await Promise.all([
        prisma.costEvent.findMany({ where: { timestamp: { gte: todayStart } } }),
        prisma.costEvent.findMany({ where: { timestamp: { gte: weekStart } } }),
        prisma.costEvent.findMany({ where: { timestamp: { gte: monthStart } } }),
        prisma.costEvent.findMany({
          where: { timestamp: { gte: prevMonthStart, lt: monthStart } },
        }),
        prisma.agent.findMany({
          include: {
            _count: { select: { costEvents: true } },
            costEvents: {
              select: {
                costUsd: true,
                inputTokens: true,
                outputTokens: true,
                provider: true,
                timestamp: true,
              },
            },
          },
        }),
        prisma.budgetAlert.findMany({
          where: { isActive: true },
          include: { agent: { select: { name: true } } },
        }),
      ]);

    const totalCostToday = todayEvents.reduce((sum, e) => sum + e.costUsd, 0);
    const totalCostWeek = weekEvents.reduce((sum, e) => sum + e.costUsd, 0);
    const totalCostMonth = monthEvents.reduce((sum, e) => sum + e.costUsd, 0);
    const totalCostPrevMonth = prevMonthEvents.reduce((sum, e) => sum + e.costUsd, 0);
    const costChangePercent = percentChange(totalCostMonth, totalCostPrevMonth);

    const costByProvider: Record<string, number> = {};
    for (const evt of monthEvents) {
      costByProvider[evt.provider] = (costByProvider[evt.provider] ?? 0) + evt.costUsd;
    }

    const timeSeriesMap = new Map<string, { cost: number; events: number }>();
    for (const evt of monthEvents) {
      const dateKey = evt.timestamp.toISOString().split("T")[0];
      const entry = timeSeriesMap.get(dateKey) ?? { cost: 0, events: 0 };
      entry.cost += evt.costUsd;
      entry.events += 1;
      timeSeriesMap.set(dateKey, entry);
    }
    const costTimeSeries: TimeSeriesPoint[] = Array.from(timeSeriesMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({ date, cost: Math.round(data.cost * 10000) / 10000, events: data.events }));

    const topAgents = allAgents
      .map((agent) => {
        const agentCostByProvider: Record<string, number> = {};
        let totalCost = 0;
        let totalInput = 0;
        let totalOutput = 0;
        for (const evt of agent.costEvents) {
          totalCost += evt.costUsd;
          totalInput += evt.inputTokens ?? 0;
          totalOutput += evt.outputTokens ?? 0;
          agentCostByProvider[evt.provider] =
            (agentCostByProvider[evt.provider] ?? 0) + evt.costUsd;
        }
        return {
          id: agent.id,
          name: agent.name,
          description: agent.description,
          projectId: agent.projectId,
          totalCost,
          eventCount: agent._count.costEvents,
          totalInputTokens: totalInput,
          totalOutputTokens: totalOutput,
          lastActivity: agent.costEvents[0]?.timestamp?.toISOString() ?? null,
          costByProvider: agentCostByProvider,
        };
      })
      .sort((a, b) => b.totalCost - a.totalCost)
      .slice(0, 10);

    const budgetAlertStatuses: BudgetAlertStatus[] = await Promise.all(
      budgetAlerts.map(async (alert) => {
        let periodStart: Date;
        const periodNow = new Date();
        if (alert.periodType === "daily") {
          periodStart = new Date(periodNow.getFullYear(), periodNow.getMonth(), periodNow.getDate());
        } else if (alert.periodType === "weekly") {
          periodStart = new Date(periodNow);
          periodStart.setDate(periodStart.getDate() - 7);
        } else {
          periodStart = new Date(periodNow);
          periodStart.setDate(periodStart.getDate() - 30);
        }

        const where: Record<string, unknown> = { timestamp: { gte: periodStart } };
        if (alert.agentId) where.agentId = alert.agentId;

        const events = await prisma.costEvent.findMany({ where });
        const currentSpend = events.reduce((sum, e) => sum + e.costUsd, 0);

        return {
          id: alert.id,
          name: alert.name,
          agentId: alert.agentId,
          agentName: alert.agent?.name ?? null,
          budgetUsd: alert.budgetUsd,
          periodType: alert.periodType,
          currentSpend,
          percentUsed: alert.budgetUsd > 0 ? (currentSpend / alert.budgetUsd) * 100 : 0,
          isOver: currentSpend > alert.budgetUsd,
        };
      })
    );

    const data: DashboardData = {
      totalCostToday,
      totalCostWeek,
      totalCostMonth,
      costChangePercent,
      activeAgents: allAgents.length,
      totalEvents: monthEvents.length,
      costByProvider,
      costTimeSeries,
      topAgents,
      budgetAlerts: budgetAlertStatuses,
    };

    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
