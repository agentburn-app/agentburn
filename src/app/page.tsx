import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Nav } from "@/components/nav";

export const metadata: Metadata = {
  title: "AgentBurn — Know What Every Agent Costs",
  description:
    "Track, analyze, and optimize AI agent spending in real time. Cost dashboards for OpenAI, Anthropic, E2B, Composio, and every provider in your stack.",
  alternates: { canonical: "/" },
};

const PROVIDERS = [
  "OpenAI", "Anthropic", "Google", "Mistral", "Cohere",
  "E2B", "Composio", "Browserbase", "Mem0", "Stripe",
];

// Nav is now a client component imported from @/components/nav

function Hero() {
  return (
    <section className="relative overflow-hidden bg-surface-950 pt-14">
      <div className="absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-brand-600/[0.07] blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 pb-0 pt-20 sm:pt-28">
        <div className="mx-auto max-w-[680px] text-center">
          <p className="mb-5 text-[13px] font-medium tracking-wide text-brand-400">
            OPEN SOURCE &middot; SELF-HOSTABLE &middot; FREE
          </p>
          <h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-tight text-white sm:text-[3.25rem]">
            Know what every agent costs before your invoice does
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-surface-200/60">
            One API call per action. One dashboard for every provider.
            Cost-per-agent, cost-per-task, cost-per-dollar — in real time.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-brand-500"
            >
              Get started free
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/dashboard/integrate"
              className="inline-flex items-center gap-2 rounded-lg border border-surface-700/60 px-6 py-2.5 text-sm font-medium text-surface-200/70 transition-colors hover:border-surface-600 hover:text-white"
            >
              Read the docs
            </Link>
          </div>
        </div>

        {/* Dashboard mockup — the product IS the hero */}
        <div className="relative mx-auto mt-14 max-w-5xl">
          <div className="absolute -inset-px rounded-t-xl bg-gradient-to-b from-brand-500/20 to-transparent blur-sm" />
          <div className="relative overflow-hidden rounded-t-xl border border-surface-700/40 bg-surface-900 shadow-2xl shadow-black/40">
            <div className="flex items-center gap-1.5 border-b border-surface-800 px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-surface-700/50" />
              <span className="h-2.5 w-2.5 rounded-full bg-surface-700/50" />
              <span className="h-2.5 w-2.5 rounded-full bg-surface-700/50" />
              <span className="ml-3 text-[11px] text-surface-200/30">localhost:3000/dashboard</span>
            </div>
            <div className="p-5 sm:p-8">
              {/* Stat row */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Today", value: "$12.84", delta: "+18%", up: true },
                  { label: "This week", value: "$67.41", delta: "-4%", up: false },
                  { label: "Active agents", value: "7", delta: "+2", up: true },
                  { label: "Events (24h)", value: "1,847", delta: "+312", up: true },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg border border-surface-700/30 bg-surface-800/50 p-3">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-surface-200/30">{s.label}</p>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-lg font-semibold text-white">{s.value}</span>
                      <span className={`text-[10px] font-medium ${s.up ? "text-emerald-400" : "text-amber-400"}`}>{s.delta}</span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Chart placeholder */}
              <div className="mt-5 overflow-hidden rounded-lg border border-surface-700/30 bg-surface-800/50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-surface-200/40">Cost over time</span>
                  <span className="text-[10px] text-surface-200/20">Last 14 days</span>
                </div>
                <div className="flex h-28 items-end gap-[3px] sm:h-36">
                  {[28, 35, 22, 40, 38, 55, 48, 62, 45, 58, 72, 65, 78, 82].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t-sm bg-brand-500/60 transition-all hover:bg-brand-400/80" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
              {/* Agent row */}
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { name: "research-agent", provider: "anthropic", cost: "$4.21", tokens: "142K" },
                  { name: "code-reviewer", provider: "openai", cost: "$3.08", tokens: "98K" },
                  { name: "data-pipeline", provider: "google", cost: "$2.17", tokens: "67K" },
                ].map((a) => (
                  <div key={a.name} className="flex items-center justify-between rounded-lg border border-surface-700/30 bg-surface-800/50 px-3 py-2.5">
                    <div>
                      <p className="text-[12px] font-medium text-surface-100">{a.name}</p>
                      <p className="text-[10px] text-surface-200/30">{a.provider} &middot; {a.tokens} tokens</p>
                    </div>
                    <span className="font-mono text-[12px] font-medium text-white">{a.cost}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Fade out bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-surface-950 to-transparent" />
        </div>
      </div>
    </section>
  );
}

function ProviderBar() {
  return (
    <section className="border-b border-surface-200/10 bg-surface-950 py-10">
      <div className="mx-auto max-w-6xl px-6">
        <p className="mb-5 text-center text-[11px] font-medium uppercase tracking-widest text-surface-200/25">
          Works with every provider in your stack
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {PROVIDERS.map((p) => (
            <span key={p} className="text-[13px] font-medium text-surface-200/35 transition-colors hover:text-surface-200/60">
              {p}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductSection() {
  return (
    <section className="bg-white py-24" id="product">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-[12px] font-semibold uppercase tracking-widest text-brand-600">How it works</p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-surface-900 sm:text-3xl">
            Three lines to cost visibility
          </h2>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Left: code */}
          <div>
            <div className="overflow-hidden rounded-xl border border-surface-200 bg-surface-950 shadow-lg">
              <div className="flex items-center gap-1.5 border-b border-surface-800 px-4 py-2.5">
                <span className="h-2 w-2 rounded-full bg-red-400/60" />
                <span className="h-2 w-2 rounded-full bg-amber-400/60" />
                <span className="h-2 w-2 rounded-full bg-emerald-400/60" />
                <span className="ml-2 text-[11px] text-surface-200/30">track_costs.py</span>
              </div>
              <pre className="overflow-x-auto p-5 text-[13px] leading-relaxed">
                <code>
                  <span className="text-violet-400">import</span>
                  <span className="text-surface-200"> requests</span>{"\n\n"}
                  <span className="text-surface-200/40"># After every LLM call, send one event</span>{"\n"}
                  <span className="text-surface-200">requests.</span>
                  <span className="text-amber-300">post</span>
                  <span className="text-surface-200">(</span>
                  <span className="text-emerald-400">&quot;/api/ingest&quot;</span>
                  <span className="text-surface-200">, json=</span>
                  <span className="text-surface-200">{"{"}</span>{"\n"}
                  <span className="text-surface-200">{"    "}</span>
                  <span className="text-emerald-400">&quot;agentId&quot;</span>
                  <span className="text-surface-200">: </span>
                  <span className="text-emerald-400">&quot;research-agent&quot;</span>
                  <span className="text-surface-200">,</span>{"\n"}
                  <span className="text-surface-200">{"    "}</span>
                  <span className="text-emerald-400">&quot;provider&quot;</span>
                  <span className="text-surface-200">: </span>
                  <span className="text-emerald-400">&quot;anthropic&quot;</span>
                  <span className="text-surface-200">,</span>{"\n"}
                  <span className="text-surface-200">{"    "}</span>
                  <span className="text-emerald-400">&quot;model&quot;</span>
                  <span className="text-surface-200">: </span>
                  <span className="text-emerald-400">&quot;claude-sonnet-4-20250514&quot;</span>
                  <span className="text-surface-200">,</span>{"\n"}
                  <span className="text-surface-200">{"    "}</span>
                  <span className="text-emerald-400">&quot;costUsd&quot;</span>
                  <span className="text-surface-200">: </span>
                  <span className="text-amber-300">0.08</span>
                  <span className="text-surface-200">,</span>{"\n"}
                  <span className="text-surface-200">{"    "}</span>
                  <span className="text-emerald-400">&quot;inputTokens&quot;</span>
                  <span className="text-surface-200">: </span>
                  <span className="text-amber-300">2400</span>
                  <span className="text-surface-200">,</span>{"\n"}
                  <span className="text-surface-200">{"    "}</span>
                  <span className="text-emerald-400">&quot;outputTokens&quot;</span>
                  <span className="text-surface-200">: </span>
                  <span className="text-amber-300">800</span>{"\n"}
                  <span className="text-surface-200">{"}"})</span>
                </code>
              </pre>
            </div>
            <p className="mt-4 text-center text-[12px] text-surface-700/40">
              Python &middot; Node.js &middot; curl &middot; any language with HTTP
            </p>
          </div>

          {/* Right: feature descriptions */}
          <div className="flex flex-col justify-center space-y-8">
            {[
              {
                number: "01",
                title: "Ingest cost events",
                detail: "One POST per LLM call, tool use, or compute action. Batch up to 1,000 events. Authenticated with an API key.",
              },
              {
                number: "02",
                title: "Costs aggregate automatically",
                detail: "Grouped by agent, provider, model, and operation. Time-series data updates in real time. No configuration needed.",
              },
              {
                number: "03",
                title: "Set budget guardrails",
                detail: "Daily, weekly, or monthly limits per agent or globally. Webhook alerts to Slack or Discord before you overspend.",
              },
            ].map((step) => (
              <div key={step.number} className="flex gap-4">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-50 text-[11px] font-bold text-brand-600">
                  {step.number}
                </span>
                <div>
                  <h3 className="text-[15px] font-semibold text-surface-900">{step.title}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-surface-700/60">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CapabilitiesSection() {
  return (
    <section className="border-y border-surface-200 bg-surface-50 py-24" id="features">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-[12px] font-semibold uppercase tracking-widest text-brand-600">Capabilities</p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-surface-900 sm:text-3xl">
            Built for teams that ship agents
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-surface-200 bg-surface-200 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Real-time dashboard",
              detail: "Today&rsquo;s spend, weekly trends, per-provider breakdowns. No refresh needed.",
            },
            {
              title: "Per-agent accounting",
              detail: "Register agents, tag by project. See exactly which agent burns budget and why.",
            },
            {
              title: "Budget alerts",
              detail: "Threshold-based alerts per agent or globally. Webhook delivery to Slack, Discord, email.",
            },
            {
              title: "Cost explorer",
              detail: "Filter by date range, provider, agent, model. Export time-series data.",
            },
            {
              title: "Multi-provider",
              detail: "OpenAI, Anthropic, Google, Mistral, Cohere, E2B, Composio — or any custom provider.",
            },
            {
              title: "Self-hostable",
              detail: "Next.js + MySQL. Deploy to any VPS, Docker, or your own server. MIT-licensed, no vendor lock-in.",
            },
          ].map((cap) => (
            <article key={cap.title} className="bg-white p-6 sm:p-8">
              <h3 className="text-[14px] font-semibold text-surface-900">{cap.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-surface-700/55">{cap.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const check = (
    <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
  const dash = <span className="text-surface-200/30">&mdash;</span>;

  const plans = [
    {
      name: "Community",
      price: "Free",
      priceSub: "forever",
      desc: "For solo builders and experimentation",
      cta: "Get started free",
      ctaHref: "/auth/signup",
      ctaStyle: "border border-surface-200 text-surface-700 hover:bg-surface-50",
      highlighted: false,
      features: [
        { text: "5 agents", has: true },
        { text: "50K events / month", has: true },
        { text: "30-day data retention", has: true },
        { text: "Real-time dashboard", has: true },
        { text: "3 budget alerts", has: true },
        { text: "Self-host (MIT core)", has: true },
        { text: "Webhook alerts", has: false },
        { text: "Batch ingestion", has: false },
        { text: "Team members", has: false },
      ],
    },
    {
      name: "Pro",
      price: "$39",
      priceSub: "/ month",
      desc: "For teams shipping agents to production",
      cta: "Subscribe — $39/mo",
      ctaHref: "/auth/signup?plan=pro",
      ctaStyle: "bg-brand-600 text-white hover:bg-brand-500",
      highlighted: true,
      features: [
        { text: "Unlimited agents", has: true },
        { text: "1M events / month", has: true },
        { text: "90-day data retention", has: true },
        { text: "Real-time dashboard", has: true },
        { text: "Unlimited budget alerts", has: true },
        { text: "Self-host (license key)", has: true },
        { text: "Slack, Discord, email webhooks", has: true },
        { text: "Batch ingestion (1K/req)", has: true },
        { text: "5 team members", has: true },
      ],
    },
    {
      name: "Enterprise",
      price: "Custom",
      priceSub: "",
      desc: "For orgs that need governance at scale",
      cta: "Contact us",
      ctaHref: "mailto:support@agentburn.dev",
      ctaStyle: "border border-surface-200 text-surface-700 hover:bg-surface-50",
      highlighted: false,
      features: [
        { text: "Everything in Pro", has: true },
        { text: "Unlimited events", has: true },
        { text: "Unlimited retention", has: true },
        { text: "Custom integrations", has: true },
        { text: "Dedicated support", has: true },
        { text: "On-prem deployment option", has: true },
        { text: "Custom webhook destinations", has: true },
        { text: "Data export & API access", has: true },
        { text: "SLA & priority support", has: true },
      ],
    },
  ];

  return (
    <section className="bg-white py-24" id="pricing">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-[12px] font-semibold uppercase tracking-widest text-brand-600">Open-core pricing</p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-surface-900 sm:text-3xl">
            Free to start. Pay when you scale.
          </h2>
          <p className="mt-3 text-[14px] text-surface-700/50">
            The core is MIT-licensed. Self-host forever or let us run it for you.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-xl border p-6 ${
                plan.highlighted
                  ? "border-brand-500 shadow-lg shadow-brand-500/10 ring-1 ring-brand-500"
                  : "border-surface-200"
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-3 py-0.5 text-[11px] font-semibold text-white">
                  Most popular
                </span>
              )}
              <h3 className="text-[15px] font-semibold text-surface-900">{plan.name}</h3>
              <p className="mt-1 text-[12px] text-surface-700/50">{plan.desc}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-surface-900">{plan.price}</span>
                {plan.priceSub && <span className="text-[13px] text-surface-700/40">{plan.priceSub}</span>}
              </div>
              {plan.ctaHref.startsWith("mailto:") ? (
                <a
                  href={plan.ctaHref}
                  className={`mt-5 block w-full rounded-lg py-2 text-center text-[13px] font-medium transition-colors ${plan.ctaStyle}`}
                >
                  {plan.cta}
                </a>
              ) : (
                <Link
                  href={plan.ctaHref}
                  className={`mt-5 block w-full rounded-lg py-2 text-center text-[13px] font-medium transition-colors ${plan.ctaStyle}`}
                >
                  {plan.cta}
                </Link>
              )}
              <ul className="mt-6 space-y-2.5 border-t border-surface-100 pt-5">
                {plan.features.map((f) => (
                  <li key={f.text} className="flex items-center gap-2.5 text-[13px] text-surface-700">
                    {f.has ? check : dash}
                    <span className={f.has ? "" : "text-surface-700/30"}>{f.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SocialProofSection() {
  return (
    <section className="border-t border-surface-200 bg-surface-50 py-24">
      <div className="mx-auto max-w-4xl px-6">
        <h2 className="mb-2 text-center text-2xl font-bold text-surface-900">
          Built for real agent workloads
        </h2>
        <p className="mb-10 text-center text-[14px] text-surface-700/60">
          One dashboard for every dollar your agents spend
        </p>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              stat: "5 min",
              label: "To first dashboard",
              detail: "Clone, configure, deploy. See costs immediately.",
            },
            {
              stat: "100%",
              label: "Open source core",
              detail: "MIT-licensed. Self-host forever. No vendor lock-in.",
            },
            {
              stat: "Any provider",
              label: "LLMs, compute, tools",
              detail: "OpenAI, Anthropic, E2B, Browserbase — one view.",
            },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-surface-200 bg-white p-6 text-center">
              <p className="text-2xl font-bold text-brand-600">{item.stat}</p>
              <p className="mt-1 text-[13px] font-medium text-surface-900">{item.label}</p>
              <p className="mt-2 text-[12px] text-surface-700/50">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BottomCTA() {
  return (
    <section className="bg-surface-950 py-24">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">
          Start tracking agent costs in 5 minutes
        </h2>
        <p className="mx-auto mt-4 max-w-md text-[14px] text-surface-200/50">
          MIT-licensed core. No credit card. No vendor lock-in.
          Self-host forever or let us run it for you.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-2.5 text-sm font-medium text-surface-950 transition-colors hover:bg-surface-100"
          >
            Get started free
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/dashboard/integrate"
            className="inline-flex items-center gap-2 rounded-lg border border-surface-700/60 px-6 py-2.5 text-sm font-medium text-surface-200/70 transition-colors hover:border-surface-600 hover:text-white"
          >
            View API docs
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-surface-800 bg-surface-950 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
        <p className="text-[12px] text-surface-200/25">
          &copy; {new Date().getFullYear()} AgentBurn &middot; Open source under MIT
        </p>
        <nav aria-label="Footer navigation" className="flex flex-wrap gap-5 text-[12px] text-surface-200/30">
          <Link href="/blog" className="transition-colors hover:text-white">Blog</Link>
          <Link href="/dashboard" className="transition-colors hover:text-white">Dashboard</Link>
          <Link href="/dashboard/integrate" className="transition-colors hover:text-white">Docs</Link>
          <Link href="/privacy" className="transition-colors hover:text-white">Privacy</Link>
          <Link href="/terms" className="transition-colors hover:text-white">Terms</Link>
          <a href="mailto:support@agentburn.dev" className="transition-colors hover:text-white">Contact</a>
        </nav>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <ProviderBar />
        <ProductSection />
        <CapabilitiesSection />
        <PricingSection />
        <SocialProofSection />
        <BottomCTA />
      </main>
      <Footer />
    </>
  );
}
