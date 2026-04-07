"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import {
  Key,
  Webhook,
  Database,
  Copy,
  Eye,
  EyeOff,
  ExternalLink,
} from "lucide-react";

export default function SettingsPage() {
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState("");

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <div>
      <Header title="Settings" subtitle="Configure your AgentBurn instance" />
      <div className="mx-auto max-w-3xl space-y-6 p-6">

        <section className="stat-card">
          <div className="flex items-center gap-3 border-b border-surface-200 pb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50">
              <Key className="h-4 w-4 text-brand-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-surface-900">API Key</h2>
              <p className="text-xs text-surface-700/50">Used to authenticate cost event ingestion requests</p>
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-1 block text-xs font-medium text-surface-700">Current API Key</label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type={showKey ? "text" : "password"}
                  value="dev-key-change-me"
                  readOnly
                  className="w-full rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 font-mono text-sm text-surface-700"
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-surface-700/40 hover:text-surface-700"
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <button
                onClick={() => handleCopy("dev-key-change-me", "api-key")}
                className="rounded-lg border border-surface-200 p-2 text-surface-700/40 transition-colors hover:text-surface-700"
              >
                <Copy className="h-4 w-4" />
              </button>
              {copied === "api-key" && (
                <span className="text-xs font-medium text-emerald-500">Copied!</span>
              )}
            </div>
            <p className="mt-2 text-xs text-surface-700/50">
              Set via the <code className="rounded bg-surface-100 px-1.5 py-0.5 font-mono text-brand-600">API_KEY</code> environment variable.
              Restart the server after changing.
            </p>
          </div>
        </section>

        <section className="stat-card">
          <div className="flex items-center gap-3 border-b border-surface-200 pb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
              <Webhook className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-surface-900">Webhook Notifications</h2>
              <p className="text-xs text-surface-700/50">Get notified when budget alerts trigger</p>
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-1 block text-xs font-medium text-surface-700">Webhook URL</label>
            <input
              type="url"
              placeholder="https://hooks.slack.com/services/..."
              className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <p className="mt-2 text-xs text-surface-700/50">
              Set via the <code className="rounded bg-surface-100 px-1.5 py-0.5 font-mono text-brand-600">ALERT_WEBHOOK_URL</code> environment variable.
              Supports Slack, Discord, and generic webhook endpoints.
            </p>
          </div>
        </section>

        <section className="stat-card">
          <div className="flex items-center gap-3 border-b border-surface-200 pb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
              <Database className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-surface-900">Database</h2>
              <p className="text-xs text-surface-700/50">Current data store configuration</p>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-surface-700/60">Provider</span>
              <span className="rounded-full bg-surface-100 px-2.5 py-0.5 text-xs font-medium text-surface-700">MySQL</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-surface-700/60">Location</span>
              <code className="text-xs font-mono text-surface-700">mysql.agentburn.dev</code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-surface-700/60">ORM</span>
              <span className="text-xs text-surface-700">Prisma</span>
            </div>
            <div className="rounded-lg bg-brand-50 p-3">
              <p className="text-xs text-brand-800">
                <strong>Schema changes:</strong> Edit <code className="font-mono">prisma/schema.prisma</code>, then run{" "}
                <code className="font-mono">npx prisma db push</code> to apply. Use an SSH tunnel for local access:{" "}
                <code className="font-mono">ssh -N -L 3308:mysql.agentburn.dev:3306 agentburn@agentburn.dev</code>
              </p>
            </div>
          </div>
        </section>

        <section className="stat-card">
          <div className="flex items-center gap-3 border-b border-surface-200 pb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50">
              <ExternalLink className="h-4 w-4 text-violet-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-surface-900">Google Analytics</h2>
              <p className="text-xs text-surface-700/50">Track visitor behavior on your landing page</p>
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-1 block text-xs font-medium text-surface-700">Measurement ID</label>
            <input
              type="text"
              placeholder="G-XXXXXXXXXX"
              className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <p className="mt-2 text-xs text-surface-700/50">
              Set via the <code className="rounded bg-surface-100 px-1.5 py-0.5 font-mono text-brand-600">NEXT_PUBLIC_GA_MEASUREMENT_ID</code> environment variable.
              Get your ID from{" "}
              <a
                href="https://analytics.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-brand-600 hover:text-brand-500"
              >
                Google Analytics
              </a>.
            </p>
          </div>
        </section>

        <section className="stat-card">
          <h2 className="text-sm font-semibold text-surface-900 mb-3">Environment Variables Reference</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-200 text-left text-xs font-medium uppercase tracking-wider text-surface-700/50">
                  <th className="py-2 pr-4">Variable</th>
                  <th className="py-2 pr-4">Required</th>
                  <th className="py-2">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {[
                  ["DATABASE_URL", "Yes", "Prisma connection string (MySQL)"],
                  ["API_KEY", "Yes", "Authentication key for the /api/ingest endpoint"],
                  ["ALERT_WEBHOOK_URL", "No", "Slack/Discord webhook for budget alert notifications"],
                  ["NEXT_PUBLIC_GA_MEASUREMENT_ID", "No", "Google Analytics 4 measurement ID (G-XXXXXX)"],
                  ["NEXT_PUBLIC_SITE_URL", "No", "Canonical site URL for SEO meta tags"],
                ].map(([variable, required, desc]) => (
                  <tr key={variable}>
                    <td className="py-2 pr-4">
                      <code className="rounded bg-surface-100 px-1.5 py-0.5 font-mono text-xs text-brand-600">{variable}</code>
                    </td>
                    <td className="py-2 pr-4 text-xs">
                      {required === "Yes" ? (
                        <span className="font-medium text-red-500">Required</span>
                      ) : (
                        <span className="text-surface-700/50">Optional</span>
                      )}
                    </td>
                    <td className="py-2 text-xs text-surface-700">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
