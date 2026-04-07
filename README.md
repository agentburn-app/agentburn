# AgentBurn

**Know what every agent costs.**

Open-core cost intelligence for AI agent infrastructure. Track spending across your entire stack — LLM providers, compute sandboxes, tool integrations — in real time.

[agentburn.dev](https://agentburn.dev)

## Quick Start

```bash
# Clone and install
git clone https://github.com/agentburn-app/agentburn.git
cd agentburn
npm install

# Set up database and seed demo data
npx prisma generate && npx prisma db push
npm run seed

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

## API

### Register an Agent

```bash
curl -X POST http://localhost:3000/api/agents \
  -H "Content-Type: application/json" \
  -d '{"name": "research-agent", "projectId": "my-project"}'
```

### Ingest Cost Events

```bash
curl -X POST http://localhost:3000/api/ingest \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "agentId": "AGENT_ID",
    "provider": "anthropic",
    "model": "claude-sonnet-4-20250514",
    "operation": "llm_call",
    "inputTokens": 2400,
    "outputTokens": 800,
    "costUsd": 0.08
  }'
```

Supports batch ingestion — send an array of up to 1,000 events per request.

### Dashboard Data

```bash
curl http://localhost:3000/api/dashboard
```

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: MySQL via Prisma
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── agents/      # CRUD for agent entities
│   │   ├── alerts/      # Budget alert management
│   │   ├── auth/        # Signup, signin, signout, session
│   │   ├── costs/       # Cost explorer queries
│   │   ├── dashboard/   # Aggregated dashboard data
│   │   ├── ingest/      # Cost event ingestion endpoint
│   │   └── stripe/      # Checkout & webhook handlers
│   ├── auth/            # Sign in / sign up pages
│   └── dashboard/       # Dashboard UI pages
├── components/
│   ├── analytics/       # Google Analytics
│   ├── dashboard/       # Chart, table, stat components
│   ├── layout/          # Sidebar, header
│   └── nav.tsx          # Landing page nav (mobile hamburger)
├── lib/
│   ├── auth.ts             # JWT session helpers
│   ├── cost-calculator.ts  # Model pricing & cost estimation
│   ├── db.ts               # Prisma client singleton
│   ├── stripe.ts           # Stripe client
│   └── utils.ts            # Formatting, colors, helpers
├── middleware.ts            # Auth guard for /dashboard routes
└── types/
    └── index.ts            # Shared TypeScript interfaces
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | MySQL connection string | — |
| `API_KEY` | Auth key for the ingest endpoint | `dev-key-change-me` |
| `ALERT_WEBHOOK_URL` | Optional Slack/Discord webhook for budget alerts | — |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for SEO | `https://agentburn.dev` |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics measurement ID | — |
| `JWT_SECRET` | Secret for signing session tokens | — |
| `STRIPE_SECRET_KEY` | Stripe secret key | — |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | — |
| `STRIPE_PRO_PRICE_ID` | Stripe Price ID for the Pro plan | — |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | — |

## Pricing

AgentBurn is open-core:

- **Community** (free) — 5 agents, 50K events/mo, 30-day retention, MIT-licensed core
- **Pro** ($39/mo) — unlimited agents, 1M events/mo, webhooks, batch ingestion, team seats
- **Enterprise** (custom) — dedicated support, custom integrations, on-prem deployment, SLA

Self-host the MIT core forever. Or let us run it for you.

## License

MIT — see [LICENSE](./LICENSE)
