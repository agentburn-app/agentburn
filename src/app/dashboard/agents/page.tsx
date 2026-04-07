"use client";

import { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/layout/header";
import {
  Bot,
  Plus,
  X,
  Activity,
} from "lucide-react";
import { formatCurrency, formatTokens, getProviderColor, cn } from "@/lib/utils";
import type { AgentSummary } from "@/types";

interface CreateAgentForm {
  name: string;
  description: string;
  projectId: string;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<CreateAgentForm>({ name: "", description: "", projectId: "" });
  const [creating, setCreating] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentSummary | null>(null);

  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch("/api/agents");
      if (!res.ok) throw new Error("Failed to fetch agents");
      const data = await res.json();
      setAgents(data);
    } catch (err) {
      console.error("Agents fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description || undefined,
          projectId: form.projectId || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to create agent");
      setForm({ name: "", description: "", projectId: "" });
      setShowCreate(false);
      await fetchAgents();
    } catch (err) {
      console.error("Create agent error:", err);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <Header title="Agents" subtitle={`${agents.length} agents registered`} />
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-surface-700/60">Manage your agent registry and view per-agent cost breakdowns.</p>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-500"
          >
            <Plus className="h-4 w-4" />
            New Agent
          </button>
        </div>

        {showCreate && (
          <div className="stat-card mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-surface-900">Register New Agent</h3>
              <button onClick={() => setShowCreate(false)} className="text-surface-700/40 hover:text-surface-700">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-surface-700">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="My Agent"
                  className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-surface-700">Project ID</label>
                <input
                  type="text"
                  value={form.projectId}
                  onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                  placeholder="my-project"
                  className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-surface-700">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="What does this agent do?"
                  className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleCreate}
                disabled={!form.name.trim() || creating}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-500 disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Agent"}
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="space-y-3">
              {agents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className={cn(
                    "stat-card w-full text-left transition-all",
                    selectedAgent?.id === agent.id && "ring-2 ring-brand-500"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50">
                        <Bot className="h-4.5 w-4.5 text-brand-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-surface-900">{agent.name}</p>
                        <p className="text-xs text-surface-700/50">
                          {agent.projectId ?? "No project"} &middot; {agent.eventCount.toLocaleString()} events
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm font-semibold text-surface-900">{formatCurrency(agent.totalCost)}</p>
                      <p className="text-[11px] text-surface-700/50">total cost</p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-1.5">
                    {Object.keys(agent.costByProvider).map((provider) => (
                      <span
                        key={provider}
                        className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium capitalize text-white"
                        style={{ backgroundColor: getProviderColor(provider) }}
                      >
                        {provider}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
              {agents.length === 0 && (
                <div className="stat-card flex h-48 items-center justify-center">
                  <p className="text-sm text-surface-700/50">No agents yet. Create one above.</p>
                </div>
              )}
            </div>
          </div>

          <div>
            {selectedAgent ? (
              <div className="stat-card">
                <div className="flex items-center gap-3 border-b border-surface-200 pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
                    <Bot className="h-5 w-5 text-brand-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-surface-900">{selectedAgent.name}</h3>
                    <p className="text-xs text-surface-700/50">{selectedAgent.description ?? "No description"}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-surface-700/60">Total Cost</span>
                    <span className="font-mono text-sm font-semibold">{formatCurrency(selectedAgent.totalCost)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-surface-700/60">Events</span>
                    <span className="text-sm font-medium">{selectedAgent.eventCount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-surface-700/60">Input Tokens</span>
                    <span className="font-mono text-sm">{formatTokens(selectedAgent.totalInputTokens)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-surface-700/60">Output Tokens</span>
                    <span className="font-mono text-sm">{formatTokens(selectedAgent.totalOutputTokens)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-surface-700/60">Avg Cost/Event</span>
                    <span className="font-mono text-sm">
                      {selectedAgent.eventCount > 0
                        ? formatCurrency(selectedAgent.totalCost / selectedAgent.eventCount)
                        : "—"}
                    </span>
                  </div>
                  {selectedAgent.lastActivity && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-surface-700/60">Last Activity</span>
                      <span className="text-xs text-surface-700">
                        {new Date(selectedAgent.lastActivity).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 border-t border-surface-200 pt-4">
                  <p className="mb-2 text-xs font-medium text-surface-700/60">Cost by Provider</p>
                  <div className="space-y-2">
                    {Object.entries(selectedAgent.costByProvider)
                      .sort(([, a], [, b]) => b - a)
                      .map(([provider, cost]) => (
                        <div key={provider} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className="inline-block h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: getProviderColor(provider) }}
                            />
                            <span className="text-xs capitalize text-surface-700">{provider}</span>
                          </div>
                          <span className="font-mono text-xs font-medium">{formatCurrency(cost)}</span>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="mt-4 border-t border-surface-200 pt-4">
                  <p className="mb-2 text-xs font-medium text-surface-700/60">Agent ID</p>
                  <code className="block rounded bg-surface-100 px-2 py-1 text-[11px] font-mono text-surface-700 break-all">
                    {selectedAgent.id}
                  </code>
                </div>
              </div>
            ) : (
              <div className="stat-card flex h-64 items-center justify-center">
                <div className="text-center">
                  <Activity className="mx-auto h-8 w-8 text-surface-700/20" />
                  <p className="mt-2 text-sm text-surface-700/50">Select an agent to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
