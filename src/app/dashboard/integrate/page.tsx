"use client";

import { Header } from "@/components/layout/header";
import { Copy } from "lucide-react";
import { useState } from "react";

function CodeBlock({ code, language = "bash" }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative">
      <pre className="overflow-x-auto rounded-lg bg-surface-900 p-4 text-sm text-surface-100">
        <code>{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 rounded-md bg-surface-800 p-1.5 text-surface-200/60 opacity-0 transition-opacity hover:text-white group-hover:opacity-100"
      >
        <Copy className="h-3.5 w-3.5" />
        {copied && <span className="absolute -left-12 top-1 text-[10px] text-emerald-400">Copied!</span>}
      </button>
    </div>
  );
}

export default function IntegratePage() {
  return (
    <div>
      <Header title="Integrate" subtitle="Connect your agents to AgentBurn in minutes" />
      <div className="mx-auto max-w-3xl space-y-8 p-6">

        <section className="stat-card space-y-4">
          <h2 className="text-base font-semibold text-surface-900">1. Register an Agent</h2>
          <p className="text-sm text-surface-700">Create an agent to group cost events under a named entity.</p>
          <CodeBlock
            language="bash"
            code={`curl -X POST http://localhost:3000/api/agents \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "My Agent",
    "description": "Handles customer onboarding workflows",
    "projectId": "onboarding",
    "tags": ["support", "onboarding"]
  }'`}
          />
          <p className="text-xs text-surface-700/50">Returns the agent object with its <code className="rounded bg-surface-100 px-1.5 py-0.5 font-mono text-brand-600">id</code> — use this in cost events.</p>
        </section>

        <section className="stat-card space-y-4">
          <h2 className="text-base font-semibold text-surface-900">2. Ingest Cost Events</h2>
          <p className="text-sm text-surface-700">Send a single event or a batch (up to 1,000). Authenticate with your API key.</p>
          <CodeBlock
            language="bash"
            code={`curl -X POST http://localhost:3000/api/ingest \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{
    "agentId": "AGENT_ID_HERE",
    "provider": "anthropic",
    "model": "claude-3.5-sonnet",
    "operation": "llm_call",
    "inputTokens": 12500,
    "outputTokens": 3200,
    "costUsd": 0.0855,
    "taskId": "ticket-CTMS-5109",
    "workflowId": "sprint-42"
  }'`}
          />
          <div className="rounded-lg bg-brand-50 p-3">
            <p className="text-xs font-medium text-brand-800">Batch mode: Send an array of events in a single request for high-throughput ingestion.</p>
          </div>
        </section>

        <section className="stat-card space-y-4">
          <h2 className="text-base font-semibold text-surface-900">3. Python SDK Example</h2>
          <p className="text-sm text-surface-700">Drop-in wrapper for your agent code.</p>
          <CodeBlock
            language="python"
            code={`import requests

class AgentBurn:
    def __init__(self, base_url, api_key, agent_id):
        self.base_url = base_url
        self.api_key = api_key
        self.agent_id = agent_id

    def track(self, provider, cost_usd, **kwargs):
        requests.post(
            f"{self.base_url}/api/ingest",
            headers={"x-api-key": self.api_key},
            json={
                "agentId": self.agent_id,
                "provider": provider,
                "costUsd": cost_usd,
                **kwargs
            }
        )

# Usage
finops = AgentBurn("https://your-domain.com", "your-key", "agent-id")
finops.track("anthropic", 0.085, model="claude-3.5-sonnet",
             operation="llm_call", inputTokens=12500, outputTokens=3200)`}
          />
        </section>

        <section className="stat-card space-y-4">
          <h2 className="text-base font-semibold text-surface-900">4. Event Schema</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-200 text-left text-xs font-medium uppercase tracking-wider text-surface-700/50">
                  <th className="py-2 pr-4">Field</th>
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">Required</th>
                  <th className="py-2">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {[
                  ["agentId", "string", "Yes", "ID of the registered agent"],
                  ["provider", "string", "Yes", "Service provider (openai, anthropic, e2b, etc.)"],
                  ["operation", "string", "Yes", "llm_call | tool_call | compute | api_call"],
                  ["costUsd", "number", "Yes", "Cost in USD"],
                  ["model", "string", "No", "Model name (gpt-4o, claude-3.5-sonnet, etc.)"],
                  ["inputTokens", "integer", "No", "Input/prompt tokens"],
                  ["outputTokens", "integer", "No", "Output/completion tokens"],
                  ["taskId", "string", "No", "Group events by task"],
                  ["workflowId", "string", "No", "Group events by workflow"],
                  ["metadata", "object", "No", "Arbitrary JSON metadata"],
                  ["timestamp", "ISO 8601", "No", "Event time (defaults to now)"],
                ].map(([field, type, required, desc]) => (
                  <tr key={field}>
                    <td className="py-2 pr-4 font-mono text-xs text-brand-600">{field}</td>
                    <td className="py-2 pr-4 text-xs text-surface-700">{type}</td>
                    <td className="py-2 pr-4 text-xs">{required === "Yes" ? <span className="text-red-500 font-medium">Required</span> : <span className="text-surface-700/50">Optional</span>}</td>
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
