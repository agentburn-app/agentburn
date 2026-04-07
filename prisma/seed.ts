import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomInt(min: number, max: number): number {
  return Math.floor(randomBetween(min, max));
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log("Seeding database...");

  await prisma.costEvent.deleteMany();
  await prisma.budgetAlert.deleteMany();
  await prisma.agent.deleteMany();

  const agents = await Promise.all([
    prisma.agent.create({
      data: {
        name: "Calibre Engineering Agent",
        description: "Autonomous code generation and PR creation agent",
        projectId: "calibre",
        tags: JSON.stringify(["engineering", "code-gen", "jira"]),
      },
    }),
    prisma.agent.create({
      data: {
        name: "Support Triage Bot",
        description: "Classifies and routes customer support tickets",
        projectId: "support-ops",
        tags: JSON.stringify(["support", "classification", "routing"]),
      },
    }),
    prisma.agent.create({
      data: {
        name: "Data Pipeline Orchestrator",
        description: "Manages ETL workflows and data quality checks",
        projectId: "data-platform",
        tags: JSON.stringify(["data", "etl", "orchestration"]),
      },
    }),
    prisma.agent.create({
      data: {
        name: "Security Scanner",
        description: "Scans PRs for vulnerabilities and compliance issues",
        projectId: "security",
        tags: JSON.stringify(["security", "scanning", "compliance"]),
      },
    }),
    prisma.agent.create({
      data: {
        name: "Content Writer",
        description: "Generates marketing copy and documentation",
        projectId: "marketing",
        tags: JSON.stringify(["content", "writing", "marketing"]),
      },
    }),
  ]);

  const providers = [
    { name: "anthropic", models: ["claude-3.5-sonnet", "claude-3-haiku", "claude-sonnet-4"] },
    { name: "openai", models: ["gpt-4o", "gpt-4o-mini"] },
    { name: "e2b", models: [null] },
    { name: "composio", models: [null] },
    { name: "browserbase", models: [null] },
  ];

  const operations: Array<"llm_call" | "tool_call" | "compute" | "api_call"> = [
    "llm_call",
    "tool_call",
    "compute",
    "api_call",
  ];

  const now = new Date();
  const events: Array<{
    agentId: string;
    provider: string;
    model: string | null;
    operation: "llm_call" | "tool_call" | "compute" | "api_call";
    inputTokens: number | null;
    outputTokens: number | null;
    costUsd: number;
    taskId: string | null;
    workflowId: string | null;
    metadata: string | null;
    timestamp: Date;
  }> = [];

  for (let dayOffset = 30; dayOffset >= 0; dayOffset--) {
    const eventsPerDay = randomInt(20, 80);

    for (let i = 0; i < eventsPerDay; i++) {
      const agent = pick(agents);
      const providerInfo = pick(providers);
      const model = pick(providerInfo.models);
      const operation = model ? pick(["llm_call", "llm_call", "llm_call", "tool_call"] as const) : pick(["compute", "api_call", "tool_call"] as const);

      let inputTokens: number | null = null;
      let outputTokens: number | null = null;
      let costUsd: number;

      if (operation === "llm_call") {
        inputTokens = randomInt(500, 50000);
        outputTokens = randomInt(200, 15000);
        const inputCostPer1M = model?.includes("opus") ? 15 : model?.includes("4o-mini") ? 0.15 : model?.includes("haiku") ? 0.25 : 3.0;
        const outputCostPer1M = model?.includes("opus") ? 75 : model?.includes("4o-mini") ? 0.6 : model?.includes("haiku") ? 1.25 : 15.0;
        costUsd = (inputTokens / 1_000_000) * inputCostPer1M + (outputTokens / 1_000_000) * outputCostPer1M;
      } else if (operation === "compute") {
        costUsd = randomBetween(0.001, 0.05);
      } else {
        costUsd = randomBetween(0.0001, 0.01);
      }

      const timestamp = new Date(now);
      timestamp.setDate(timestamp.getDate() - dayOffset);
      timestamp.setHours(randomInt(6, 22), randomInt(0, 59), randomInt(0, 59));

      events.push({
        agentId: agent.id,
        provider: providerInfo.name,
        model,
        operation,
        inputTokens,
        outputTokens,
        costUsd: Math.round(costUsd * 1_000_000) / 1_000_000,
        taskId: `task-${randomInt(1000, 9999)}`,
        workflowId: Math.random() > 0.5 ? `wf-${randomInt(100, 999)}` : null,
        metadata: null,
        timestamp,
      });
    }
  }

  let created = 0;
  const batchSize = 100;
  for (let i = 0; i < events.length; i += batchSize) {
    const batch = events.slice(i, i + batchSize);
    await prisma.costEvent.createMany({ data: batch });
    created += batch.length;
  }
  console.log(`  Created ${created} cost events across ${agents.length} agents`);

  await Promise.all([
    prisma.budgetAlert.create({
      data: {
        agentId: agents[0].id,
        name: "Calibre daily limit",
        budgetUsd: 5.0,
        periodType: "daily",
      },
    }),
    prisma.budgetAlert.create({
      data: {
        name: "Global monthly budget",
        budgetUsd: 200.0,
        periodType: "monthly",
      },
    }),
    prisma.budgetAlert.create({
      data: {
        agentId: agents[4].id,
        name: "Content Writer weekly cap",
        budgetUsd: 25.0,
        periodType: "weekly",
      },
    }),
  ]);
  console.log("  Created 3 budget alerts");

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
