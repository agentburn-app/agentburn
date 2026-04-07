import type { Metadata, Viewport } from "next";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://agentburn.dev";
const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#4f46e5",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AgentBurn — Know What Every Agent Costs",
    template: "%s | AgentBurn",
  },
  description:
    "Track, analyze, and optimize spending across your AI agent infrastructure. Monitor LLM costs, compute usage, and tool calls across OpenAI, Anthropic, E2B, Composio, and more.",
  keywords: [
    "AI agent costs",
    "LLM cost tracking",
    "agent burn rate",
    "agentburn",
    "agent finops",
    "AI infrastructure monitoring",
    "OpenAI cost dashboard",
    "Anthropic cost tracking",
    "agent orchestration costs",
    "AI spending analytics",
    "token usage tracking",
    "agent budget alerts",
    "FinOps for AI",
    "AI cost optimization",
  ],
  authors: [{ name: "AgentBurn" }],
  creator: "AgentBurn",
  publisher: "AgentBurn",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "AgentBurn",
    title: "AgentBurn — Know What Every Agent Costs",
    description:
      "Track, analyze, and optimize AI agent spending in real time. Monitor LLM costs, compute usage, and tool calls in one dashboard.",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "AgentBurn Dashboard — AI Agent Cost Intelligence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AgentBurn — Know What Every Agent Costs",
    description:
      "Track, analyze, and optimize AI agent spending in real time.",
    images: [`${siteUrl}/og-image.png`],
  },
  alternates: {
    canonical: siteUrl,
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "AgentBurn",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "Cost intelligence platform for AI agent infrastructure. Track LLM costs, compute usage, and tool calls across your entire agent stack.",
    url: siteUrl,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free tier — up to 5 agents tracked",
    },
    featureList: [
      "Real-time cost tracking across LLM providers",
      "Per-agent and per-workflow cost breakdowns",
      "Budget alerts with configurable thresholds",
      "Token usage analytics",
      "Multi-provider support (OpenAI, Anthropic, E2B, Composio)",
      "REST API for cost event ingestion",
    ],
  };

  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {gaId && <GoogleAnalytics measurementId={gaId} />}
        {children}
      </body>
    </html>
  );
}
