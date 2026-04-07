import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const agents = await prisma.agent.findMany({
      include: {
        _count: { select: { costEvents: true } },
        costEvents: {
          select: { costUsd: true, inputTokens: true, outputTokens: true, provider: true, timestamp: true },
          orderBy: { timestamp: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const summaries = agents.map((agent) => {
      const costByProvider: Record<string, number> = {};
      let totalCost = 0;
      let totalInput = 0;
      let totalOutput = 0;

      for (const evt of agent.costEvents) {
        totalCost += evt.costUsd;
        totalInput += evt.inputTokens ?? 0;
        totalOutput += evt.outputTokens ?? 0;
        costByProvider[evt.provider] = (costByProvider[evt.provider] ?? 0) + evt.costUsd;
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
        lastActivity: agent.costEvents[0]?.timestamp ?? null,
        costByProvider,
      };
    });

    return NextResponse.json(summaries);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, projectId, tags } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const agent = await prisma.agent.create({
      data: {
        name,
        description: description ?? null,
        projectId: projectId ?? null,
        tags: tags ? JSON.stringify(tags) : null,
      },
    });

    return NextResponse.json(agent, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
