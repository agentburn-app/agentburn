export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: "product" | "comparison" | "guide" | "case-study";
  tags: string[];
  readTime: number;
  content: string;
}

export const BLOG_POSTS: BlogPost[] = [
  // ── Product Posts ──────────────────────────────────────────────────────
  {
    slug: "what-is-agentburn",
    title: "What Is AgentBurn? Open-Source Cost Tracking for AI Agents",
    description:
      "AgentBurn is an open-source cost intelligence platform that tracks spending across your entire AI agent stack — LLMs, compute sandboxes, tool calls, and more.",
    date: "2025-04-01",
    category: "product",
    tags: ["agentburn", "open-source", "ai-costs", "introduction"],
    readTime: 5,
    content: `
<p>If you're running AI agents in production, you already know the problem: costs are invisible until they're not. A single runaway agent loop can burn through hundreds of dollars in minutes, and by the time you notice, your OpenAI bill looks like a phone number.</p>

<p><strong>AgentBurn</strong> is an open-source cost intelligence platform built specifically for AI agent infrastructure. It tracks every dollar across your entire stack — LLM API calls, compute sandboxes like E2B, tool integrations like Composio and Browserbase, and anything else your agents touch.</p>

<h2>Why Agent Costs Are Different</h2>

<p>Traditional cloud cost tools like AWS Cost Explorer or Vantage were built for infrastructure — VMs, storage, network egress. They don't understand the unit economics of AI agents:</p>

<ul>
<li><strong>Token-level granularity</strong> — An agent might make 50 LLM calls per task, each with different input/output token counts and pricing tiers</li>
<li><strong>Multi-provider stacks</strong> — A single agent workflow might hit OpenAI for reasoning, Anthropic for analysis, and E2B for code execution</li>
<li><strong>Non-linear scaling</strong> — Agent costs don't scale linearly with users. A complex query might cost 100x more than a simple one</li>
<li><strong>Cascading failures</strong> — Retry loops, hallucination-triggered re-runs, and tool call chains can multiply costs exponentially</li>
</ul>

<h2>How AgentBurn Works</h2>

<p>AgentBurn sits between your agents and your wallet. You instrument your agent code with a lightweight SDK or REST API call, and AgentBurn records every cost event in real time.</p>

<pre><code>curl -X POST https://agentburn.dev/api/ingest \\
  -H "x-api-key: YOUR_KEY" \\
  -d '{
    "agentId": "research-bot",
    "provider": "anthropic",
    "model": "claude-sonnet-4-20250514",
    "operation": "llm_call",
    "inputTokens": 2400,
    "outputTokens": 800,
    "costUsd": 0.08
  }'</code></pre>

<p>From there, you get real-time dashboards showing cost breakdowns by agent, provider, model, and time period. Set budget alerts so you know before you blow past your monthly spend target.</p>

<h2>Open-Core Model</h2>

<p>AgentBurn's core is MIT-licensed. Self-host it forever, modify it, contribute back. The hosted Pro and Enterprise tiers add team features, higher event limits, and integrations — but the cost tracking engine itself is free and open.</p>

<h2>Getting Started</h2>

<p>Clone the repo, run the setup script, and you'll have a cost dashboard running locally in under two minutes. Point your agents at the ingest API and start seeing where your money goes.</p>
`,
  },
  {
    slug: "track-openai-costs-across-agents",
    title: "How to Track OpenAI Costs Across Multiple AI Agents",
    description:
      "Step-by-step guide to instrumenting your OpenAI API calls with AgentBurn for per-agent cost visibility, budget alerts, and spend optimization.",
    date: "2025-04-03",
    category: "guide",
    tags: ["openai", "cost-tracking", "tutorial", "api"],
    readTime: 7,
    content: `
<p>OpenAI's billing dashboard shows you a single number: total spend. If you're running multiple agents, each making dozens of API calls per task, that number is useless. You need per-agent, per-model, per-task cost breakdowns.</p>

<h2>The Problem with OpenAI's Built-in Billing</h2>

<p>OpenAI gives you monthly totals and daily usage charts. That's it. No way to attribute costs to specific agents, workflows, or customers. If your support bot and your research agent share the same API key, you're flying blind.</p>

<h2>Setting Up Per-Agent Tracking</h2>

<p>AgentBurn tracks costs at the event level. Each API call becomes a cost event tagged with the agent that made it.</p>

<h3>Step 1: Register Your Agents</h3>

<pre><code># Register each agent with a unique ID
curl -X POST https://your-agentburn.dev/api/agents \\
  -H "Content-Type: application/json" \\
  -d '{"name": "support-bot", "projectId": "customer-service"}'

curl -X POST https://your-agentburn.dev/api/agents \\
  -H "Content-Type: application/json" \\
  -d '{"name": "research-agent", "projectId": "data-team"}'</code></pre>

<h3>Step 2: Instrument Your OpenAI Calls</h3>

<p>After every OpenAI API call, send the token usage and cost to AgentBurn:</p>

<pre><code>import openai
import requests

response = openai.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": prompt}]
)

# Calculate cost (gpt-4o: $2.50/1M input, $10/1M output)
input_cost = response.usage.prompt_tokens * 2.50 / 1_000_000
output_cost = response.usage.completion_tokens * 10.00 / 1_000_000

requests.post("https://your-agentburn.dev/api/ingest", json={
    "agentId": "support-bot",
    "provider": "openai",
    "model": "gpt-4o",
    "operation": "llm_call",
    "inputTokens": response.usage.prompt_tokens,
    "outputTokens": response.usage.completion_tokens,
    "costUsd": input_cost + output_cost
}, headers={"x-api-key": "YOUR_KEY"})</code></pre>

<h3>Step 3: Set Budget Alerts</h3>

<p>Configure alerts so you know when any agent exceeds its daily or monthly budget:</p>

<pre><code>curl -X POST https://your-agentburn.dev/api/alerts \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Support bot daily limit",
    "agentId": "AGENT_ID",
    "budgetUsd": 50,
    "periodType": "daily"
  }'</code></pre>

<h2>What You'll See</h2>

<p>Once instrumented, your AgentBurn dashboard shows: cost per agent over time, token usage breakdown (input vs output), cost per model (GPT-4o vs GPT-4o-mini), and spend velocity so you can predict monthly totals.</p>

<h2>Optimization Tips</h2>

<ul>
<li><strong>Route simple tasks to cheaper models</strong> — Use GPT-4o-mini for classification, GPT-4o for reasoning</li>
<li><strong>Cache common prompts</strong> — If multiple users ask similar questions, cache the response</li>
<li><strong>Shorten system prompts</strong> — Every token in your system prompt is charged on every call</li>
<li><strong>Set hard daily limits</strong> — AgentBurn alerts catch runaway loops before they drain your budget</li>
</ul>
`,
  },
  {
    slug: "budget-alerts-ai-agents",
    title: "Setting Up Budget Alerts for Your AI Agent Fleet",
    description:
      "How to configure per-agent budget alerts with AgentBurn to prevent runaway costs and get notified via Slack, Discord, or webhook before you overspend.",
    date: "2025-04-05",
    category: "guide",
    tags: ["budget-alerts", "cost-management", "slack", "webhooks"],
    readTime: 5,
    content: `
<p>The scariest moment in AI engineering isn't a production outage — it's opening your provider dashboard Monday morning and seeing a four-figure bill from a weekend retry loop.</p>

<p>Budget alerts are your safety net. AgentBurn lets you set per-agent, per-period spending thresholds that fire before you hit your limit, not after.</p>

<h2>Why Per-Agent Alerts Matter</h2>

<p>A global spending cap is a blunt instrument. If your total monthly budget is $5,000 and your research agent burns through $4,000 in the first week, your support bot goes dark for three weeks. Per-agent alerts let you allocate budget where it matters and catch anomalies at the source.</p>

<h2>Alert Configuration</h2>

<p>AgentBurn supports three period types: daily, weekly, and monthly. Best practice is to set all three:</p>

<ul>
<li><strong>Daily alerts</strong> — Catch runaway loops and retry storms within hours</li>
<li><strong>Weekly alerts</strong> — Spot gradual cost creep from prompt changes or traffic spikes</li>
<li><strong>Monthly alerts</strong> — Stay within your overall budget allocation per agent</li>
</ul>

<h2>Webhook Integration</h2>

<p>AgentBurn fires webhook notifications when spend crosses your threshold. Point it at Slack, Discord, PagerDuty, or any HTTP endpoint:</p>

<pre><code># In your .env
ALERT_WEBHOOK_URL="https://hooks.slack.com/services/T00/B00/xxx"</code></pre>

<p>The webhook payload includes the agent name, current spend, budget limit, period type, and a direct link to the cost dashboard for that agent.</p>

<h2>Setting Effective Thresholds</h2>

<p>Start by running your agents for a week with no alerts, just tracking. Look at the daily cost distribution in the AgentBurn dashboard. Set your daily alert at 1.5x the average daily cost — tight enough to catch anomalies, loose enough to avoid noise.</p>

<p>For monthly budgets, take your target annual AI spend, divide by 12, then allocate across agents by priority. Your customer-facing agents should get a larger share than internal tools.</p>
`,
  },
  {
    slug: "open-core-self-host-vs-cloud",
    title: "Self-Host vs Cloud: AgentBurn's Open-Core Model Explained",
    description:
      "AgentBurn is MIT-licensed at its core. Learn when to self-host for free and when the hosted Pro tier makes sense for your team.",
    date: "2025-04-08",
    category: "product",
    tags: ["open-core", "self-hosted", "pricing", "deployment"],
    readTime: 6,
    content: `
<p>AgentBurn is open-core: the cost tracking engine, dashboard, API, and alerting system are all MIT-licensed. You can self-host it on a $5/month VPS and track every dollar your agents spend — forever, for free.</p>

<p>So why would anyone pay for the hosted version? Because running infrastructure isn't free, even when the software is.</p>

<h2>Community (Free, Self-Hosted)</h2>

<p>The MIT-licensed core includes everything a solo developer or small team needs:</p>
<ul>
<li>Up to 5 agents tracked</li>
<li>50,000 cost events per month</li>
<li>30-day data retention</li>
<li>Real-time dashboards</li>
<li>Budget alerts</li>
<li>REST API for ingestion</li>
<li>MySQL database via Prisma</li>
</ul>

<p>Deploy it on any Node.js host: a VPS, your Kubernetes cluster, a Raspberry Pi. It's a standard Next.js app with Prisma ORM — nothing exotic.</p>

<h2>When to Upgrade to Pro ($39/month)</h2>

<p>The hosted Pro tier makes sense when:</p>
<ul>
<li><strong>You need team access</strong> — Pro supports 5 team members with role-based access</li>
<li><strong>You're past 5 agents</strong> — Pro tracks unlimited agents</li>
<li><strong>You need higher event volume</strong> — 1M events/month vs 50K</li>
<li><strong>You want webhook integrations</strong> — Slack, Discord, PagerDuty alerts</li>
<li><strong>You don't want to maintain infrastructure</strong> — We handle uptime, backups, and updates</li>
</ul>

<h2>Enterprise</h2>

<p>For organizations running hundreds of agents across multiple teams: SSO/SAML, RBAC, custom SLAs, on-premise deployment support, and data export to Snowflake or BigQuery for deep analytics.</p>

<h2>The Philosophy</h2>

<p>We believe cost visibility should be free. The core problem — "where is my money going?" — shouldn't be locked behind a paywall. We charge for scale, collaboration, and convenience, not for the basic insight that your research agent is 10x more expensive than you thought.</p>
`,
  },
  {
    slug: "realtime-token-usage-dashboards",
    title: "Real-Time Token Usage Dashboards for LLM-Powered Agents",
    description:
      "How AgentBurn's dashboards break down token consumption by agent, model, and time period to help you understand and optimize LLM spending.",
    date: "2025-04-10",
    category: "product",
    tags: ["dashboards", "token-usage", "analytics", "llm"],
    readTime: 5,
    content: `
<p>Tokens are the atoms of LLM costs. Every prompt you send and every response you receive is metered in tokens, and the price difference between models can be 100x. A real-time token usage dashboard isn't a nice-to-have — it's essential.</p>

<h2>What AgentBurn Tracks</h2>

<p>Every cost event ingested into AgentBurn includes input tokens, output tokens, model name, and dollar cost. The dashboard aggregates this into actionable views:</p>

<ul>
<li><strong>Cost over time</strong> — Line chart showing daily/weekly/monthly spend with trend lines</li>
<li><strong>Provider breakdown</strong> — Pie chart showing OpenAI vs Anthropic vs others as a percentage of total spend</li>
<li><strong>Agent leaderboard</strong> — Which agents are your biggest spenders?</li>
<li><strong>Model comparison</strong> — Are you overpaying by using GPT-4o where GPT-4o-mini would suffice?</li>
<li><strong>Token efficiency</strong> — Input-to-output token ratio reveals prompt bloat</li>
</ul>

<h2>Reading the Dashboard</h2>

<p>The most important metric isn't total spend — it's <strong>cost per task</strong>. If your customer support agent costs $0.12 per ticket resolution, that's great. If it costs $2.40, you have a prompt engineering problem.</p>

<p>AgentBurn's task and workflow grouping lets you attribute costs to business outcomes, not just API calls. Tag your cost events with <code>taskId</code> and <code>workflowId</code> to unlock this view.</p>

<h2>Spotting Anomalies</h2>

<p>The time-series chart is your early warning system. A sudden spike means something changed — a new prompt, a retry loop, or a traffic surge. Combined with budget alerts, you'll catch issues within minutes, not days.</p>

<h2>Input vs Output Token Ratio</h2>

<p>A healthy agent typically has a 2:1 to 5:1 input-to-output ratio. If you see 20:1, your system prompts are bloated. If you see 1:5, your agent is generating too much text. Both indicate optimization opportunities.</p>
`,
  },
  // ── Educational Posts ─────────────────────────────────────────────────
  {
    slug: "hidden-costs-ai-agents-production",
    title: "The Hidden Costs of Running AI Agents in Production",
    description:
      "Beyond LLM API fees: the real costs of AI agents include compute, tool calls, retries, embeddings, and infrastructure overhead that most teams underestimate.",
    date: "2025-04-12",
    category: "guide",
    tags: ["ai-costs", "production", "infrastructure", "optimization"],
    readTime: 8,
    content: `
<p>When teams budget for AI agents, they think about LLM API costs. But the LLM call is often less than half the total cost of running an agent in production.</p>

<h2>The Full Cost Stack</h2>

<h3>1. LLM API Calls (40-60% of Total)</h3>
<p>The obvious one. But even here, teams underestimate. A single user query might trigger 5-15 LLM calls as the agent reasons, plans, executes tools, and synthesizes results. Each call has both input and output token costs, and input tokens are often 3-5x the output.</p>

<h3>2. Embedding Costs (10-20%)</h3>
<p>If your agents use RAG (retrieval-augmented generation), every document chunk needs an embedding. At scale, embedding costs add up. OpenAI's text-embedding-3-small is cheap per call but expensive at millions of documents.</p>

<h3>3. Compute Sandboxes (10-25%)</h3>
<p>Agents that write and execute code need sandboxed environments. E2B charges per second of compute time. A code generation agent that runs 30-second test suites on every iteration can cost more in compute than in LLM calls.</p>

<h3>4. Tool Call APIs (5-15%)</h3>
<p>Web search, browser automation, database queries, file operations. Each tool call has a cost. Browserbase charges for page loads. Search APIs charge per query. These add up fast when an agent makes 20+ tool calls per task.</p>

<h3>5. Retries and Error Handling (5-15%)</h3>
<p>Rate limits, timeouts, malformed responses, and hallucinated tool calls all trigger retries. A well-designed retry policy might add 10% to costs. A poor one can 10x them.</p>

<h3>6. Infrastructure Overhead (5-10%)</h3>
<p>Servers, databases, message queues, monitoring, logging. These are real costs that scale with agent volume.</p>

<h2>Tracking the Full Picture</h2>

<p>AgentBurn tracks all of these — not just LLM calls. Every cost event can specify any provider and operation type. Send your E2B compute costs, your Browserbase page loads, your vector DB queries. One dashboard for everything.</p>

<p>The first step to optimization is visibility. You can't reduce what you can't see.</p>
`,
  },
  {
    slug: "ai-agent-budget-3x-what-you-think",
    title: "Why Your AI Agent Budget Is 3x What You Think",
    description:
      "Most teams underestimate AI agent costs by 3x. Learn the four budget blind spots and how to build accurate cost projections.",
    date: "2025-04-14",
    category: "guide",
    tags: ["budgeting", "cost-estimation", "planning", "ai-costs"],
    readTime: 6,
    content: `
<p>Teams running AI agents in production commonly underestimate their first-year costs by 2-4x. Here are the four most common budget blind spots.</p>

<h2>Blind Spot 1: Prototype Costs ≠ Production Costs</h2>

<p>Your prototype handles 10 queries a day with carefully crafted prompts. Production handles 10,000 queries with messy real-world input. Users ask edge-case questions. Agents retry on failures. Context windows fill up. The cost per query in production is typically 2-3x what you saw in testing.</p>

<h2>Blind Spot 2: Token Inflation</h2>

<p>System prompts grow over time. Every new feature, guardrail, and edge case handling adds tokens to your system prompt. A system prompt that started at 200 tokens bloats to 2,000 tokens within months. That's charged on every single API call.</p>

<h2>Blind Spot 3: Multi-Turn Conversations</h2>

<p>LLM APIs charge for the full conversation history on each turn. A 10-turn conversation doesn't cost 10x a single turn — it costs 55x (1+2+3+...+10 turns of accumulated context). Long conversations are disproportionately expensive.</p>

<h2>Blind Spot 4: Error Multiplication</h2>

<p>When an agent hallucinates a tool call, it fails, retries, potentially hallucinates again, and eventually escalates. A single bad response can trigger a chain of 5-10 additional LLM calls. At scale, error handling can account for 15-25% of your total LLM spend.</p>

<h2>Building Accurate Projections</h2>

<p>Run AgentBurn for two weeks in production with real traffic. Look at the P95 cost per task, not the average. Multiply by projected volume. Add 30% for growth and prompt changes. That's your real budget.</p>

<p>Teams that track from day one avoid the surprise $50K bill in month three.</p>
`,
  },
  {
    slug: "finops-for-ai-cloud-cost-principles",
    title: "FinOps for AI: Applying Cloud Cost Principles to LLM Spending",
    description:
      "The FinOps framework that transformed cloud spending can be applied to AI agent costs. Here's how to implement visibility, optimization, and governance for LLM budgets.",
    date: "2025-04-16",
    category: "guide",
    tags: ["finops", "cloud-costs", "framework", "governance"],
    readTime: 7,
    content: `
<p>FinOps transformed how companies manage cloud spending. The same principles — visibility, optimization, and governance — apply directly to AI agent costs. But the implementation looks different.</p>

<h2>Phase 1: Visibility (Inform)</h2>

<p>In cloud FinOps, this means tagging resources and building cost dashboards. For AI agents, it means:</p>

<ul>
<li><strong>Per-agent cost attribution</strong> — Know which agent spends what</li>
<li><strong>Per-model breakdowns</strong> — Understand your model mix and pricing tiers</li>
<li><strong>Per-task economics</strong> — Calculate the cost of business outcomes, not just API calls</li>
<li><strong>Real-time dashboards</strong> — Don't wait for end-of-month bills</li>
</ul>

<p>This is where AgentBurn fits. It's the cost visibility layer for AI infrastructure, the same way CloudHealth or Vantage is for AWS/GCP.</p>

<h2>Phase 2: Optimization (Optimize)</h2>

<p>Once you can see costs, you can reduce them:</p>

<ul>
<li><strong>Model routing</strong> — Send simple tasks to cheap models (GPT-4o-mini, Haiku) and complex tasks to expensive ones (GPT-4o, Opus)</li>
<li><strong>Prompt compression</strong> — Shorter prompts mean fewer tokens</li>
<li><strong>Caching</strong> — Cache responses for identical or similar queries</li>
<li><strong>Batch processing</strong> — Some providers offer 50% discounts for async batch API calls</li>
<li><strong>Context window management</strong> — Summarize long conversations instead of sending full history</li>
</ul>

<h2>Phase 3: Governance (Operate)</h2>

<p>Sustainable cost management requires organizational processes:</p>

<ul>
<li><strong>Budget allocation</strong> — Assign budgets per team, project, and agent</li>
<li><strong>Alert policies</strong> — Automated notifications when spend crosses thresholds</li>
<li><strong>Cost review cadence</strong> — Weekly reviews of cost dashboards with engineering leads</li>
<li><strong>Approval gates</strong> — Require sign-off for new agents or model upgrades that increase costs</li>
</ul>

<p>Teams that treat AI spend like cloud spend — with visibility, optimization, and governance — are well-positioned to spend significantly less than teams that fly blind.</p>
`,
  },
  {
    slug: "reduce-anthropic-costs-smart-routing",
    title: "How to Reduce Anthropic API Costs by 40% with Smart Model Routing",
    description:
      "Not every task needs Claude Opus. Learn how to implement a model routing strategy that sends tasks to the cheapest model that can handle them.",
    date: "2025-04-18",
    category: "guide",
    tags: ["anthropic", "claude", "optimization", "model-routing"],
    readTime: 6,
    content: `
<p>Claude Opus is brilliant. It's also expensive. At $15/million input tokens and $75/million output tokens, using it for every task is like taking a helicopter to the grocery store.</p>

<h2>The Model Tier Strategy</h2>

<p>Anthropic offers three tiers with dramatically different pricing:</p>

<table>
<tr><th>Model</th><th>Input (per 1M)</th><th>Output (per 1M)</th><th>Best For</th></tr>
<tr><td>Claude Haiku</td><td>$0.25</td><td>$1.25</td><td>Classification, extraction, simple Q&A</td></tr>
<tr><td>Claude Sonnet</td><td>$3.00</td><td>$15.00</td><td>Analysis, coding, multi-step reasoning</td></tr>
<tr><td>Claude Opus</td><td>$15.00</td><td>$75.00</td><td>Complex research, long-form writing, nuanced tasks</td></tr>
</table>

<p>Haiku is 60x cheaper than Opus for input tokens. For many agent tasks — intent classification, entity extraction, simple summarization — Haiku performs just as well.</p>

<h2>Implementing a Router</h2>

<p>The simplest approach: use a cheap model to classify task complexity, then route to the appropriate tier.</p>

<pre><code># Use Haiku to classify, then route
classification = call_haiku("Classify this task as simple/medium/complex: " + task)

model_map = {
    "simple": "claude-3-5-haiku-20241022",
    "medium": "claude-sonnet-4-20250514",
    "complex": "claude-3-opus-20240229"
}

result = call_model(model_map[classification], task)</code></pre>

<p>The classification call costs fractions of a cent and saves dollars on every task that doesn't need Opus.</p>

<h2>Measuring the Impact</h2>

<p>Track costs per model in AgentBurn before and after implementing routing. Based on published pricing differences, even basic two-tier routing (Haiku + Sonnet) can reduce Anthropic spend substantially — the exact savings depend on your task distribution.</p>

<p>The dashboard's model breakdown chart makes this immediately visible — you'll see your cost distribution shift from a single expensive model to a mix of cheap and expensive, with the total trending down.</p>
`,
  },
  {
    slug: "complete-guide-llm-token-pricing-2025",
    title: "The Complete Guide to LLM Token Pricing in 2025",
    description:
      "A comprehensive pricing reference for OpenAI, Anthropic, Google, Mistral, and Cohere models with cost-per-task estimates for common agent operations.",
    date: "2025-04-20",
    category: "guide",
    tags: ["pricing", "llm", "openai", "anthropic", "google", "reference"],
    readTime: 8,
    content: `
<p>LLM pricing changes frequently and varies wildly across providers. This guide covers the major models as of 2025, with real-world cost estimates for common agent tasks.</p>

<h2>OpenAI Pricing</h2>

<table>
<tr><th>Model</th><th>Input (per 1M)</th><th>Output (per 1M)</th></tr>
<tr><td>GPT-4o</td><td>$2.50</td><td>$10.00</td></tr>
<tr><td>GPT-4o-mini</td><td>$0.15</td><td>$0.60</td></tr>
<tr><td>GPT-4 Turbo</td><td>$10.00</td><td>$30.00</td></tr>
<tr><td>o1</td><td>$15.00</td><td>$60.00</td></tr>
<tr><td>o1-mini</td><td>$3.00</td><td>$12.00</td></tr>
</table>

<h2>Anthropic Pricing</h2>

<table>
<tr><th>Model</th><th>Input (per 1M)</th><th>Output (per 1M)</th></tr>
<tr><td>Claude Opus</td><td>$15.00</td><td>$75.00</td></tr>
<tr><td>Claude Sonnet</td><td>$3.00</td><td>$15.00</td></tr>
<tr><td>Claude Haiku</td><td>$0.25</td><td>$1.25</td></tr>
</table>

<h2>Google Pricing</h2>

<table>
<tr><th>Model</th><th>Input (per 1M)</th><th>Output (per 1M)</th></tr>
<tr><td>Gemini 1.5 Pro</td><td>$1.25</td><td>$5.00</td></tr>
<tr><td>Gemini 1.5 Flash</td><td>$0.075</td><td>$0.30</td></tr>
<tr><td>Gemini 2.0 Flash</td><td>$0.10</td><td>$0.40</td></tr>
</table>

<h2>Cost Per Common Task</h2>

<p>Based on typical token usage for common agent operations:</p>

<table>
<tr><th>Task</th><th>GPT-4o</th><th>Claude Sonnet</th><th>Gemini Flash</th></tr>
<tr><td>Simple Q&A (500 in / 200 out)</td><td>$0.003</td><td>$0.004</td><td>$0.0001</td></tr>
<tr><td>Document Summary (5K in / 1K out)</td><td>$0.023</td><td>$0.030</td><td>$0.001</td></tr>
<tr><td>Code Generation (2K in / 500 out)</td><td>$0.010</td><td>$0.014</td><td>$0.0004</td></tr>
<tr><td>Multi-step Agent Task (20K in / 5K out)</td><td>$0.100</td><td>$0.135</td><td>$0.004</td></tr>
</table>

<p>These numbers explain why model routing matters so much. A multi-step agent task on Gemini Flash costs $0.004. The same task on Claude Sonnet costs $0.135 — a 33x difference.</p>

<h2>Tracking Actual Costs</h2>

<p>Published pricing is just the starting point. Actual costs depend on your prompt lengths, response sizes, retry rates, and conversation depths. By tracking your real token counts and costs over time, AgentBurn gives you ground truth for budget planning rather than relying on theoretical estimates.</p>
`,
  },
  // ── Comparison Posts ──────────────────────────────────────────────────
  {
    slug: "agentburn-vs-helicone",
    title: "AgentBurn vs Helicone: Which LLM Cost Tracker Is Right for You?",
    description:
      "A detailed comparison of AgentBurn and Helicone for AI cost tracking — covering pricing, features, self-hosting, and which tool fits which team.",
    date: "2025-04-22",
    category: "comparison",
    tags: ["helicone", "comparison", "llm-observability", "pricing"],
    readTime: 7,
    content: `
<p>Helicone and AgentBurn both help you understand LLM costs. But they approach the problem differently, and the right choice depends on your stack and priorities.</p>

<h2>Architecture</h2>

<p><strong>Helicone</strong> is a proxy. You route your LLM API calls through Helicone's servers, and it logs everything automatically. Zero code changes — just swap the base URL. The downside: all your prompts and responses flow through a third party.</p>

<p><strong>AgentBurn</strong> is an event collector. You send cost events to AgentBurn's API after each call. More instrumentation work, but your data stays in your infrastructure. And it tracks non-LLM costs (compute, tool calls) that a proxy can't see.</p>

<h2>Feature Comparison</h2>

<table>
<tr><th>Feature</th><th>AgentBurn</th><th>Helicone</th></tr>
<tr><td>LLM cost tracking</td><td>Yes</td><td>Yes</td></tr>
<tr><td>Non-LLM costs (compute, tools)</td><td>Yes</td><td>No</td></tr>
<tr><td>Self-hosted option</td><td>Yes (MIT)</td><td>Yes (Apache 2.0)</td></tr>
<tr><td>Proxy mode (zero-code)</td><td>No</td><td>Yes</td></tr>
<tr><td>Per-agent breakdown</td><td>Yes</td><td>Limited</td></tr>
<tr><td>Budget alerts</td><td>Yes</td><td>Yes</td></tr>
<tr><td>Prompt caching</td><td>No</td><td>Yes</td></tr>
<tr><td>A/B testing</td><td>No</td><td>Yes</td></tr>
</table>

<h2>When to Choose AgentBurn</h2>

<ul>
<li>You run multi-provider agent stacks (LLMs + compute + tools)</li>
<li>You want a lightweight, self-hosted cost dashboard</li>
<li>You need per-agent budget allocation and alerts</li>
<li>You don't want prompts flowing through a third-party proxy</li>
<li>You want MIT-licensed open source</li>
</ul>

<h2>When to Choose Helicone</h2>

<ul>
<li>You want zero-instrumentation setup (proxy model)</li>
<li>You need prompt caching and A/B testing</li>
<li>You primarily use a single LLM provider</li>
<li>You want detailed prompt/response logging alongside costs</li>
</ul>

<h2>Pricing</h2>

<p>Both have free tiers. AgentBurn's Community tier is free forever (self-hosted, MIT). Helicone's free tier includes 100K requests/month. AgentBurn Pro is $39/month; Helicone's Growth tier starts at $70/month.</p>

<p>For cost-focused teams running multi-provider agent stacks, AgentBurn offers better value. For teams wanting a full observability platform with minimal setup, Helicone is strong.</p>
`,
  },
  {
    slug: "agentburn-vs-portkey",
    title: "AgentBurn vs Portkey: AI Gateway vs Cost-First Monitoring",
    description:
      "Portkey is an AI gateway with observability. AgentBurn is a cost-first monitoring tool. Here's how they compare and when to use each.",
    date: "2025-04-24",
    category: "comparison",
    tags: ["portkey", "comparison", "ai-gateway", "monitoring"],
    readTime: 6,
    content: `
<p>Portkey positions itself as an "AI gateway" — a unified API layer that sits between your code and your LLM providers. AgentBurn is purpose-built for cost tracking. They overlap on cost visibility but diverge on everything else.</p>

<h2>What Portkey Does</h2>

<p>Portkey is a full AI infrastructure layer: unified API across providers, automatic retries and fallbacks, load balancing, semantic caching, prompt management, and observability including cost tracking. It's a thick middleware layer.</p>

<h2>What AgentBurn Does</h2>

<p>AgentBurn does one thing deeply: cost intelligence. Per-agent tracking, budget alerts, provider breakdowns, token analytics, and cost forecasting. It doesn't proxy your calls, manage your prompts, or handle failover.</p>

<h2>The Trade-Off</h2>

<table>
<tr><th>Dimension</th><th>AgentBurn</th><th>Portkey</th></tr>
<tr><td>Primary focus</td><td>Cost tracking</td><td>AI gateway</td></tr>
<tr><td>Setup complexity</td><td>Low (add API calls)</td><td>Medium (replace base URLs)</td></tr>
<tr><td>Vendor lock-in</td><td>None (MIT, event-based)</td><td>Medium (gateway dependency)</td></tr>
<tr><td>Non-LLM cost tracking</td><td>Yes</td><td>No</td></tr>
<tr><td>Provider fallback</td><td>No</td><td>Yes</td></tr>
<tr><td>Prompt management</td><td>No</td><td>Yes</td></tr>
<tr><td>Self-hosted</td><td>Yes</td><td>Enterprise only</td></tr>
<tr><td>Free tier</td><td>Unlimited (self-hosted)</td><td>10K requests/month</td></tr>
</table>

<h2>When to Choose AgentBurn</h2>

<p>You already have your LLM integration working. You don't want a gateway middleman. You need cost visibility across your entire agent stack (LLMs + compute + tools). You want to self-host.</p>

<h2>When to Choose Portkey</h2>

<p>You're building from scratch and want a unified API layer. You need automatic provider fallback and load balancing. Cost tracking is a secondary concern — you mainly need reliability and prompt management.</p>

<h2>Using Both</h2>

<p>Some teams use Portkey as their gateway and AgentBurn for cost tracking. Portkey handles reliability; AgentBurn handles the budget. There's no conflict — they operate at different layers.</p>
`,
  },
  {
    slug: "agentburn-vs-vantage",
    title: "AgentBurn vs Vantage: Cloud Cost Management vs Agent Cost Tracking",
    description:
      "Vantage tracks cloud infrastructure costs. AgentBurn tracks AI agent costs. Here's why you might need both — or just one.",
    date: "2025-04-26",
    category: "comparison",
    tags: ["vantage", "comparison", "cloud-costs", "infrastructure"],
    readTime: 5,
    content: `
<p>Vantage is a cloud cost management platform for AWS, GCP, Azure, and dozens of other providers. It's excellent at what it does. But it doesn't understand AI agent economics.</p>

<h2>Different Levels of Abstraction</h2>

<p>Vantage operates at the infrastructure level: EC2 instances, S3 storage, Lambda invocations, network egress. It shows you what your cloud bill looks like and helps you reduce it.</p>

<p>AgentBurn operates at the application level: which agent made which LLM call, how many tokens were used, what did that specific task cost. It shows you what your AI spend looks like and attributes it to business outcomes.</p>

<h2>Where They Overlap</h2>

<p>Vantage can show you your OpenAI line item on your cloud bill. But it can't tell you which of your 15 agents is responsible for 80% of that spend. That per-agent attribution is exactly what AgentBurn provides.</p>

<h2>Comparison</h2>

<table>
<tr><th>Capability</th><th>AgentBurn</th><th>Vantage</th></tr>
<tr><td>Cloud infrastructure costs</td><td>No</td><td>Yes</td></tr>
<tr><td>LLM API cost attribution</td><td>Per-agent, per-task</td><td>Per-account total</td></tr>
<tr><td>Token-level analytics</td><td>Yes</td><td>No</td></tr>
<tr><td>Budget alerts</td><td>Per-agent</td><td>Per-service</td></tr>
<tr><td>Self-hosted</td><td>Yes (MIT)</td><td>No</td></tr>
<tr><td>Price</td><td>Free / $39/mo</td><td>Free / $150+/mo</td></tr>
</table>

<h2>The Verdict</h2>

<p>If your biggest cost concern is cloud infrastructure, use Vantage. If it's AI agent API spend, use AgentBurn. If it's both (increasingly common), use both — they don't overlap.</p>

<p>For most teams in the AI agent space, LLM API costs overtook infrastructure costs six months ago. AgentBurn addresses the bigger line item.</p>
`,
  },
  {
    slug: "agentburn-vs-langsmith",
    title: "AgentBurn vs LangSmith: Observability vs FinOps for AI Agents",
    description:
      "LangSmith is an LLM observability platform from LangChain. AgentBurn is a cost intelligence tool. Different problems, different solutions.",
    date: "2025-04-28",
    category: "comparison",
    tags: ["langsmith", "langchain", "comparison", "observability"],
    readTime: 6,
    content: `
<p>LangSmith is LangChain's observability and evaluation platform. It logs traces, lets you debug chains, run evaluations, and monitor production LLM applications. Cost tracking is a feature, not the focus.</p>

<h2>LangSmith's Strengths</h2>

<ul>
<li><strong>Deep tracing</strong> — See every step in a LangChain/LangGraph chain with input/output at each node</li>
<li><strong>Evaluation</strong> — Run automated evals against datasets to measure quality</li>
<li><strong>Prompt playground</strong> — Test prompt variations with side-by-side comparison</li>
<li><strong>LangChain integration</strong> — First-class support if you're in the LangChain ecosystem</li>
</ul>

<h2>AgentBurn's Strengths</h2>

<ul>
<li><strong>Cost-first design</strong> — Every feature is built around understanding and reducing spend</li>
<li><strong>Framework-agnostic</strong> — Works with any agent framework (CrewAI, AutoGen, custom)</li>
<li><strong>Multi-provider tracking</strong> — LLMs, compute, tool calls, everything in one view</li>
<li><strong>Budget governance</strong> — Per-agent alerts and spend limits</li>
<li><strong>Self-hosted and MIT</strong> — No vendor dependency</li>
</ul>

<h2>The Key Difference</h2>

<p>LangSmith answers: "Why is my agent giving bad responses?" AgentBurn answers: "Why is my agent costing so much?"</p>

<p>LangSmith is a debugging and quality tool. AgentBurn is a financial management tool. They solve different problems.</p>

<h2>Comparison</h2>

<table>
<tr><th>Feature</th><th>AgentBurn</th><th>LangSmith</th></tr>
<tr><td>Cost tracking</td><td>Primary focus</td><td>Secondary feature</td></tr>
<tr><td>Trace debugging</td><td>No</td><td>Yes</td></tr>
<tr><td>Evaluations</td><td>No</td><td>Yes</td></tr>
<tr><td>Framework lock-in</td><td>None</td><td>Best with LangChain</td></tr>
<tr><td>Non-LLM costs</td><td>Yes</td><td>No</td></tr>
<tr><td>Self-hosted</td><td>Yes (MIT)</td><td>Enterprise only</td></tr>
<tr><td>Free tier</td><td>Unlimited (self-hosted)</td><td>5K traces/month</td></tr>
</table>

<h2>Using Both</h2>

<p>LangSmith for debugging and quality. AgentBurn for cost management. Many teams use both — LangSmith tells you if your agent is working correctly, AgentBurn tells you if you can afford to keep running it.</p>
`,
  },
  {
    slug: "top-5-ai-agent-cost-tracking-tools-2025",
    title: "Top 5 AI Agent Cost Tracking Tools in 2025 Compared",
    description:
      "A comprehensive comparison of the best tools for tracking AI agent costs: AgentBurn, Helicone, Portkey, LangSmith, and Vantage.",
    date: "2025-04-30",
    category: "comparison",
    tags: ["comparison", "tools", "roundup", "2025"],
    readTime: 9,
    content: `
<p>The AI agent cost tracking space is maturing fast. Here are the five tools worth evaluating in 2025, compared across the dimensions that matter most.</p>

<h2>1. AgentBurn — Best for Self-Hosted Cost Intelligence</h2>
<p><strong>Focus:</strong> Cost tracking and budget management for multi-provider agent stacks.<br/>
<strong>Pricing:</strong> Free (MIT self-hosted), Pro $39/mo, Enterprise custom.<br/>
<strong>Best for:</strong> Teams that want open-source, self-hosted cost visibility with per-agent granularity.<br/>
<strong>Limitation:</strong> No proxy mode — requires explicit instrumentation.</p>

<h2>2. Helicone — Best for Zero-Setup LLM Logging</h2>
<p><strong>Focus:</strong> LLM proxy with automatic logging, caching, and cost tracking.<br/>
<strong>Pricing:</strong> Free (100K requests/mo), Growth $70/mo.<br/>
<strong>Best for:</strong> Teams that want instant visibility with no code changes.<br/>
<strong>Limitation:</strong> LLM-only — doesn't track compute, tool calls, or non-LLM costs.</p>

<h2>3. Portkey — Best AI Gateway with Cost Visibility</h2>
<p><strong>Focus:</strong> Unified AI gateway with observability, reliability, and cost tracking.<br/>
<strong>Pricing:</strong> Free (10K requests/mo), paid plans from $49/mo.<br/>
<strong>Best for:</strong> Teams building new applications that want gateway + observability in one tool.<br/>
<strong>Limitation:</strong> Gateway dependency creates vendor lock-in.</p>

<h2>4. LangSmith — Best for LangChain Teams</h2>
<p><strong>Focus:</strong> Observability, evaluation, and debugging for LLM applications.<br/>
<strong>Pricing:</strong> Free (5K traces/mo), Plus $39/mo.<br/>
<strong>Best for:</strong> Teams in the LangChain ecosystem that need debugging + basic cost tracking.<br/>
<strong>Limitation:</strong> Cost tracking is secondary; best with LangChain, less useful with other frameworks.</p>

<h2>5. Vantage — Best for Infrastructure-Level Cloud Costs</h2>
<p><strong>Focus:</strong> Cloud cost management across AWS, GCP, Azure, and 30+ providers.<br/>
<strong>Pricing:</strong> Free tier, paid from $150/mo.<br/>
<strong>Best for:</strong> Finance teams managing overall cloud + AI API line items.<br/>
<strong>Limitation:</strong> No agent-level attribution — shows account totals, not per-agent costs.</p>

<h2>Summary Matrix</h2>

<table>
<tr><th></th><th>Self-hosted</th><th>Multi-provider agents</th><th>Zero-setup</th><th>Non-LLM costs</th><th>Free tier</th></tr>
<tr><td>AgentBurn</td><td>✅ MIT</td><td>✅</td><td>❌</td><td>✅</td><td>Unlimited</td></tr>
<tr><td>Helicone</td><td>✅ Apache</td><td>❌</td><td>✅</td><td>❌</td><td>100K req</td></tr>
<tr><td>Portkey</td><td>Enterprise</td><td>Partial</td><td>✅</td><td>❌</td><td>10K req</td></tr>
<tr><td>LangSmith</td><td>Enterprise</td><td>❌</td><td>LangChain</td><td>❌</td><td>5K traces</td></tr>
<tr><td>Vantage</td><td>❌</td><td>❌</td><td>✅</td><td>Cloud only</td><td>Yes</td></tr>
</table>

<p>If you're running multi-provider AI agents and want cost control without vendor lock-in, start with AgentBurn. Add Helicone or Portkey if you need proxy-level features. Add Vantage if cloud infrastructure is a separate cost center.</p>
`,
  },
  // ── Case Study Posts ──────────────────────────────────────────────────
  {
    slug: "customer-support-bot-saved-2400-monthly",
    title: "How Model Routing Can Cut Support Bot Costs by 75%",
    description:
      "An illustrative scenario showing how a support bot using GPT-4o for every query could cut monthly spend from $3,200 to $800 with simple model routing.",
    date: "2025-05-02",
    category: "case-study",
    tags: ["case-study", "customer-support", "optimization", "model-routing"],
    readTime: 5,
    content: `
<p>Consider a typical scenario: a customer support bot using GPT-4o for all queries at a monthly cost of around $3,200. What would happen if you applied AgentBurn's cost visibility to find optimization opportunities?</p>

<h2>The Likely Discovery</h2>

<p>Based on typical support bot workloads, a cost dashboard would likely reveal:</p>
<ol>
<li>A large portion of queries — often 60-80% — are simple FAQ-type questions (password resets, billing inquiries, feature locations)</li>
<li>System prompts tend to grow over time, inflating per-call token counts</li>
</ol>

<p>When simple queries are sent to an expensive model, you're paying premium prices for commodity work.</p>

<h2>The Optimization</h2>

<p><strong>Step 1:</strong> Classify incoming queries using GPT-4o-mini (cost: ~$0.0002 per classification). Route simple queries to GPT-4o-mini, complex ones to GPT-4o.</p>

<p><strong>Step 2:</strong> Split the system prompt into a base prompt (~200 tokens) and context modules loaded on demand. Simple queries get the base prompt only.</p>

<h2>Projected Impact</h2>

<p>Based on published model pricing (GPT-4o-mini is ~17x cheaper than GPT-4o for input tokens), a scenario like this could yield:</p>

<ul>
<li><strong>Before:</strong> ~$3,200/month (100% GPT-4o)</li>
<li><strong>After:</strong> ~$800/month (majority GPT-4o-mini, remainder GPT-4o)</li>
<li><strong>Estimated savings:</strong> ~75% reduction</li>
</ul>

<p>The key insight isn't the routing itself — it's the visibility. Without per-query cost tracking, you have no way to know that most queries don't need an expensive model. A cost dashboard makes the waste obvious.</p>
`,
  },
  {
    slug: "monitoring-crewai-multi-agent-costs",
    title: "Monitoring Multi-Agent Workflows: A CrewAI Cost Breakdown",
    description:
      "How to track costs across a CrewAI multi-agent workflow where a researcher, analyst, and writer collaborate on a single task.",
    date: "2025-05-04",
    category: "case-study",
    tags: ["crewai", "multi-agent", "workflow", "cost-breakdown"],
    readTime: 6,
    content: `
<p>Multi-agent frameworks like CrewAI orchestrate multiple specialized agents on a single task. A "research report" workflow might involve a researcher agent, an analyst agent, and a writer agent — each making dozens of LLM calls. Tracking costs across this pipeline requires per-agent and per-workflow attribution.</p>

<h2>Example Workflow</h2>

<p>Consider a content creation pipeline with three agents:</p>
<ol>
<li><strong>Researcher</strong> — Searches the web, reads documents, extracts key facts (Sonnet + Browserbase)</li>
<li><strong>Analyst</strong> — Synthesizes research into insights, identifies patterns (Opus)</li>
<li><strong>Writer</strong> — Produces the final report from the analyst's output (Sonnet)</li>
</ol>

<h2>Instrumenting CrewAI with AgentBurn</h2>

<p>Register each CrewAI agent as an AgentBurn agent, and tag all cost events with a shared <code>workflowId</code>:</p>

<pre><code>workflow_id = f"report-{uuid4()}"

# After each LLM call in the researcher agent:
ingest_event(
    agent_id="crewai-researcher",
    provider="anthropic",
    model="claude-sonnet-4-20250514",
    cost_usd=calculated_cost,
    workflow_id=workflow_id
)

# Browserbase costs for web research:
ingest_event(
    agent_id="crewai-researcher",
    provider="browserbase",
    operation="page_load",
    cost_usd=0.01,
    workflow_id=workflow_id
)</code></pre>

<h2>What a Dashboard Might Reveal</h2>

<p>In a pipeline like this, based on current model pricing, per-report costs might break down roughly as:</p>

<ul>
<li><strong>Researcher:</strong> Majority of cost — multiple LLM calls plus page loads per report</li>
<li><strong>Analyst:</strong> Moderate cost — fewer calls but larger context windows with a more expensive model</li>
<li><strong>Writer:</strong> Lowest cost — typically just a couple of Sonnet calls</li>
</ul>

<p>Often the research phase is the biggest cost driver — not because of LLM costs alone, but because of tool calls like web browsing. Caching previously visited URLs could significantly reduce researcher costs.</p>

<h2>Workflow-Level Insights</h2>

<p>AgentBurn's <code>workflowId</code> grouping lets you see the total cost of a business outcome (one report), not just individual API calls. This is the metric that matters for pricing decisions — if a report costs $0.53 to generate, you can price your service accordingly.</p>
`,
  },
  {
    slug: "tracking-e2b-sandbox-costs-code-agents",
    title: "Tracking E2B Sandbox Costs for Code Generation Agents",
    description:
      "Code generation agents use E2B sandboxes for execution. Here's how to track those compute costs alongside LLM spend for a complete cost picture.",
    date: "2025-05-06",
    category: "case-study",
    tags: ["e2b", "sandbox", "compute", "code-generation"],
    readTime: 5,
    content: `
<p>If your agents write and execute code, you're paying for two things: the LLM calls to generate code, and the compute to run it. Most cost tracking tools only see the first part. AgentBurn tracks both.</p>

<h2>The E2B Cost Model</h2>

<p>E2B charges per second of sandbox compute time. A sandbox that runs for 30 seconds costs significantly more than the LLM call that generated the code. For iterative code generation (write → run → fix → run), compute costs can exceed LLM costs.</p>

<h2>Instrumenting E2B Costs</h2>

<pre><code>import e2b
import time

sandbox = e2b.Sandbox()
start = time.time()
result = sandbox.run_code(generated_code)
duration = time.time() - start

# Track the compute cost
ingest_event(
    agent_id="code-gen-agent",
    provider="e2b",
    operation="sandbox_execution",
    cost_usd=duration * E2B_COST_PER_SECOND,
    metadata=json.dumps({"duration_s": duration, "exit_code": result.exit_code})
)</code></pre>

<h2>Illustrative Cost Split</h2>

<p>For a code generation agent that iterates until tests pass, the cost breakdown might look like:</p>

<ul>
<li><strong>LLM calls (code generation):</strong> Multiple iterations at a few cents per call</li>
<li><strong>E2B sandbox (execution):</strong> Multiple runs at several seconds each — compute cost can match or exceed LLM cost</li>
</ul>

<p>Without tracking E2B costs alongside LLM costs, you might think each task costs half of what it actually does. The compute portion is invisible without explicit tracking.</p>

<h2>Optimization Strategies</h2>

<ul>
<li><strong>Keep sandboxes warm</strong> — Reuse sandboxes across iterations to avoid cold start costs</li>
<li><strong>Set execution timeouts</strong> — Cap sandbox runtime at 30s to prevent infinite loops</li>
<li><strong>Generate tests first</strong> — Let the agent write tests before code to reduce iteration cycles</li>
<li><strong>Track iteration count</strong> — Use AgentBurn's metadata field to log how many attempts each task takes</li>
</ul>
`,
  },
  {
    slug: "cost-optimizing-rag-pipelines",
    title: "Cost-Optimizing RAG Pipelines: Embedding vs Inference Spend",
    description:
      "RAG pipelines have two cost centers: embedding documents and running inference. Here's how to measure and optimize both with AgentBurn.",
    date: "2025-05-08",
    category: "case-study",
    tags: ["rag", "embeddings", "optimization", "vector-database"],
    readTime: 6,
    content: `
<p>Retrieval-Augmented Generation (RAG) is the most common pattern for knowledge-grounded AI agents. But most teams only track the inference costs and completely miss the embedding side.</p>

<h2>The Two Cost Centers</h2>

<h3>Embedding Costs (Ingestion)</h3>
<p>Every document you add to your knowledge base needs to be embedded. OpenAI's text-embedding-3-small costs $0.02 per million tokens. Sounds cheap until you're processing 100,000 documents with an average of 2,000 tokens each — that's $4.00 just for initial ingestion. Re-index after updates and it multiplies.</p>

<h3>Inference Costs (Query Time)</h3>
<p>Each user query triggers: (1) embed the query ($0.000002), (2) retrieve relevant chunks, (3) send chunks + query to the LLM ($0.02-0.10 depending on context size and model).</p>

<h2>Tracking Both in AgentBurn</h2>

<pre><code># Track embedding costs during ingestion
ingest_event(
    agent_id="rag-indexer",
    provider="openai",
    model="text-embedding-3-small",
    operation="embedding",
    input_tokens=token_count,
    cost_usd=token_count * 0.02 / 1_000_000
)

# Track inference costs at query time
ingest_event(
    agent_id="rag-query-agent",
    provider="anthropic",
    model="claude-sonnet-4-20250514",
    operation="llm_call",
    input_tokens=context_tokens + query_tokens,
    output_tokens=response_tokens,
    cost_usd=calculated_cost
)</code></pre>

<h2>Illustrative Cost Breakdown</h2>

<p>For a hypothetical RAG system processing 50K documents and serving 1,000 queries/day, based on published API pricing:</p>

<ul>
<li><strong>Initial embedding:</strong> A few dollars (one-time) — embeddings are cheap per call</li>
<li><strong>Daily re-indexing (10% updates):</strong> Pennies per day</li>
<li><strong>Daily inference:</strong> The dominant cost — each query sends retrieved chunks to an LLM, and this scales linearly with query volume</li>
<li><strong>Key takeaway:</strong> Inference almost always dwarfs embedding costs at query volumes above a few hundred per day</li>
</ul>

<h2>Optimization Strategies</h2>

<ul>
<li><strong>Reduce context window</strong> — Send 3 relevant chunks instead of 10. Each chunk you remove saves tokens</li>
<li><strong>Use cheaper models for simple questions</strong> — Route factual lookups to Haiku/Flash, complex analysis to Sonnet</li>
<li><strong>Cache frequent queries</strong> — Many RAG systems see 30% query repetition</li>
<li><strong>Incremental indexing</strong> — Only re-embed changed documents, not the full corpus</li>
</ul>

<p>AgentBurn's provider breakdown immediately shows the embedding vs inference split, making it clear where optimization effort should focus.</p>
`,
  },
  {
    slug: "cut-agent-costs-10k-to-3k",
    title: "From $10K to $3K: A Playbook for Cutting Agent Costs 70%",
    description:
      "A step-by-step playbook showing the most common cost optimizations for AI agent infrastructure, based on typical spending patterns and published model pricing.",
    date: "2025-05-10",
    category: "case-study",
    tags: ["case-study", "optimization", "cost-reduction", "startup"],
    readTime: 7,
    content: `
<p>If you're running multiple AI agents and spending $10,000/month on LLM costs, where do the biggest savings come from? This playbook walks through the four most impactful optimizations, based on common agent cost patterns and published model pricing.</p>

<h2>Step 1: Get Visibility</h2>

<p>Before optimizing anything, instrument your agents with per-agent cost tracking. Without this, you're guessing. A typical five-agent setup might reveal a highly uneven cost distribution — often one or two agents account for the majority of spend.</p>

<h2>Optimization 1: Fix Retry Waste</h2>

<p>A common pattern: agents that produce invalid output (bad JSON, hallucinated tool calls) trigger retries that silently multiply costs. If your agent's error rate is 20-30%, you're paying 20-30% more than you should.</p>

<p><strong>Fix:</strong> Add structured output validation, fix malformed schemas, and implement proper error handling.<br/>
<strong>Typical impact:</strong> 20-35% cost reduction on the affected agent.</p>

<h2>Optimization 2: Model Routing</h2>

<p>Many agents use a single expensive model for everything. Based on published pricing, Claude Haiku is ~60x cheaper than Opus for input tokens, and GPT-4o-mini is ~17x cheaper than GPT-4o. Most support or FAQ workloads don't need the expensive model.</p>

<p><strong>Fix:</strong> Classify task complexity and route to the cheapest model that can handle it.<br/>
<strong>Typical impact:</strong> 50-75% cost reduction on agents handling mixed-complexity workloads.</p>

<h2>Optimization 3: Prompt Diet</h2>

<p>System prompts tend to grow over time as features and guardrails are added. A 6,000-token system prompt is charged on every single call. Most of that content — examples, edge cases, formatting instructions — can be loaded on demand.</p>

<p><strong>Fix:</strong> Split into a lean base prompt + conditional context modules.<br/>
<strong>Typical impact:</strong> 30-60% token reduction per call.</p>

<h2>Optimization 4: Batch Processing</h2>

<p>Some agents make real-time calls for work that doesn't need real-time responses. OpenAI's Batch API offers a 50% discount for async processing.</p>

<p><strong>Fix:</strong> Move non-urgent work (monitoring, reporting, batch analysis) to batch APIs.<br/>
<strong>Typical impact:</strong> 50% cost reduction on eligible workloads.</p>

<h2>The Compound Effect</h2>

<p>Applied together, these four optimizations can reduce total agent spend by 50-70%. None of them require changing what your agents do — only how efficiently they do it.</p>

<p>The lesson: you can't optimize what you can't measure. Instrument first, optimize second.</p>
`,
  },
];

export function getAllPosts(): BlogPost[] {
  return BLOG_POSTS.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getPostsByCategory(category: BlogPost["category"]): BlogPost[] {
  return getAllPosts().filter((p) => p.category === category);
}
