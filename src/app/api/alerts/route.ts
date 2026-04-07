import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const alerts = await prisma.budgetAlert.findMany({
      include: { agent: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });

    const enriched = await Promise.all(
      alerts.map(async (alert) => {
        const now = new Date();
        let periodStart: Date;
        if (alert.periodType === "daily") {
          periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        } else if (alert.periodType === "weekly") {
          periodStart = new Date(now);
          periodStart.setDate(periodStart.getDate() - 7);
        } else {
          periodStart = new Date(now);
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
          isActive: alert.isActive,
          currentSpend,
          percentUsed: alert.budgetUsd > 0 ? (currentSpend / alert.budgetUsd) * 100 : 0,
          isOver: currentSpend > alert.budgetUsd,
          createdAt: alert.createdAt,
        };
      })
    );

    return NextResponse.json(enriched);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, agentId, budgetUsd, periodType } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }
    if (typeof budgetUsd !== "number" || budgetUsd <= 0) {
      return NextResponse.json({ error: "budgetUsd must be a positive number" }, { status: 400 });
    }
    if (!["daily", "weekly", "monthly"].includes(periodType)) {
      return NextResponse.json({ error: "periodType must be daily, weekly, or monthly" }, { status: 400 });
    }

    const alert = await prisma.budgetAlert.create({
      data: {
        name,
        agentId: agentId ?? null,
        budgetUsd,
        periodType,
      },
    });

    return NextResponse.json(alert, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    await prisma.budgetAlert.delete({ where: { id } });
    return NextResponse.json({ deleted: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
