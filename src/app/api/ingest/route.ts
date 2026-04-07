import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { CostEventInput } from "@/types";

function authenticate(req: NextRequest): boolean {
  const apiKey = req.headers.get("x-api-key") ?? req.headers.get("authorization")?.replace("Bearer ", "");
  return apiKey === process.env.API_KEY;
}

export async function POST(req: NextRequest) {
  if (!authenticate(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const events: CostEventInput[] = Array.isArray(body) ? body : [body];

    if (events.length === 0) {
      return NextResponse.json({ error: "No events provided" }, { status: 400 });
    }

    if (events.length > 1000) {
      return NextResponse.json({ error: "Batch size limit is 1000 events" }, { status: 400 });
    }

    const results = await prisma.$transaction(
      events.map((event) =>
        prisma.costEvent.create({
          data: {
            agentId: event.agentId,
            provider: event.provider,
            model: event.model ?? null,
            operation: event.operation,
            inputTokens: event.inputTokens ?? null,
            outputTokens: event.outputTokens ?? null,
            costUsd: event.costUsd,
            taskId: event.taskId ?? null,
            workflowId: event.workflowId ?? null,
            metadata: event.metadata ? JSON.stringify(event.metadata) : null,
            timestamp: event.timestamp ? new Date(event.timestamp) : new Date(),
          },
        })
      )
    );

    return NextResponse.json({
      ingested: results.length,
      ids: results.map((r) => r.id),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
