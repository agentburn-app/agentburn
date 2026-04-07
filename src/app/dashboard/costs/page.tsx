"use client";

import { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/layout/header";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { formatCurrency, getProviderColor } from "@/lib/utils";

interface CostData {
  totalCost: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  eventCount: number;
  byProvider: Record<string, number>;
  byOperation: Record<string, number>;
  byModel: Record<string, number>;
  byAgent: Record<string, number>;
  timeSeries: Array<{ date: string; cost: number; events: number }>;
}

interface AgentOption {
  id: string;
  name: string;
}

export default function CostExplorerPage() {
  const [data, setData] = useState<CostData | null>(null);
  const [agents, setAgents] = useState<AgentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [agentFilter, setAgentFilter] = useState("");
  const [providerFilter, setProviderFilter] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ days: String(days) });
      if (agentFilter) params.set("agentId", agentFilter);
      if (providerFilter) params.set("provider", providerFilter);

      const [costRes, agentsRes] = await Promise.all([
        fetch(`/api/costs?${params}`),
        fetch("/api/agents"),
      ]);

      if (costRes.ok) setData(await costRes.json());
      if (agentsRes.ok) {
        const agentList = await agentsRes.json();
        setAgents(agentList.map((a: AgentOption) => ({ id: a.id, name: a.name })));
      }
    } catch (err) {
      console.error("Cost explorer fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [days, agentFilter, providerFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading && !data) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  const providerData = data
    ? Object.entries(data.byProvider)
        .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
        .sort((a, b) => b.value - a.value)
    : [];

  const operationData = data
    ? Object.entries(data.byOperation)
        .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
        .sort((a, b) => b.value - a.value)
    : [];

  const modelData = data
    ? Object.entries(data.byModel)
        .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
        .sort((a, b) => b.value - a.value)
    : [];

  const agentData = data
    ? Object.entries(data.byAgent)
        .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
        .sort((a, b) => b.value - a.value)
    : [];

  const opColors: Record<string, string> = {
    llm_call: "#6366f1",
    tool_call: "#f59e0b",
    compute: "#10b981",
    api_call: "#ec4899",
  };

  return (
    <div>
      <Header title="Cost Explorer" subtitle="Filter, drill down, and analyze your agent spending" />
      <div className="p-6 space-y-6">
        <div className="stat-card flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-surface-700">Time Range</label>
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="rounded-lg border border-surface-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            >
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
              <option value={60}>Last 60 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-surface-700">Agent</label>
            <select
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              className="rounded-lg border border-surface-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            >
              <option value="">All agents</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-surface-700">Provider</label>
            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              className="rounded-lg border border-surface-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            >
              <option value="">All providers</option>
              {["anthropic", "openai", "e2b", "composio", "browserbase"].map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          {(agentFilter || providerFilter) && (
            <button
              onClick={() => { setAgentFilter(""); setProviderFilter(""); }}
              className="rounded-lg border border-surface-200 px-3 py-2 text-sm text-surface-700 hover:bg-surface-50"
            >
              Clear filters
            </button>
          )}
        </div>

        {data && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="stat-card">
              <p className="text-xs font-medium uppercase tracking-wide text-surface-700/50">Total Cost</p>
              <p className="mt-1 text-2xl font-semibold">{formatCurrency(data.totalCost)}</p>
            </div>
            <div className="stat-card">
              <p className="text-xs font-medium uppercase tracking-wide text-surface-700/50">Events</p>
              <p className="mt-1 text-2xl font-semibold">{data.eventCount.toLocaleString()}</p>
            </div>
            <div className="stat-card">
              <p className="text-xs font-medium uppercase tracking-wide text-surface-700/50">Avg Cost/Event</p>
              <p className="mt-1 text-2xl font-semibold">
                {data.eventCount > 0 ? formatCurrency(data.totalCost / data.eventCount) : "—"}
              </p>
            </div>
            <div className="stat-card">
              <p className="text-xs font-medium uppercase tracking-wide text-surface-700/50">Providers</p>
              <p className="mt-1 text-2xl font-semibold">{Object.keys(data.byProvider).length}</p>
            </div>
          </div>
        )}

        {data && data.timeSeries.length > 0 && (
          <div className="stat-card">
            <h3 className="mb-4 text-sm font-semibold text-surface-900">Cost Over Time</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={data.timeSeries} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="explorerGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickFormatter={(d: string) => {
                    const date = new Date(d + "T00:00:00");
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v: number) => formatCurrency(v)} width={65} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }}
                  formatter={(value: number) => [formatCurrency(value), "Cost"]}
                />
                <Area type="monotone" dataKey="cost" stroke="#6366f1" strokeWidth={2} fill="url(#explorerGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {providerData.length > 0 && (
            <div className="stat-card">
              <h3 className="mb-4 text-sm font-semibold text-surface-900">By Provider</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={providerData} layout="vertical" margin={{ left: 70, right: 20 }}>
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v: number) => formatCurrency(v)} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} width={65} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ fontSize: "12px", borderRadius: "8px" }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {providerData.map((entry) => (
                      <Cell key={entry.name} fill={getProviderColor(entry.name)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {operationData.length > 0 && (
            <div className="stat-card">
              <h3 className="mb-4 text-sm font-semibold text-surface-900">By Operation Type</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={operationData} layout="vertical" margin={{ left: 70, right: 20 }}>
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v: number) => formatCurrency(v)} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} width={65} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ fontSize: "12px", borderRadius: "8px" }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {operationData.map((entry) => (
                      <Cell key={entry.name} fill={opColors[entry.name] ?? "#64748b"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {modelData.length > 0 && (
            <div className="stat-card">
              <h3 className="mb-4 text-sm font-semibold text-surface-900">By Model</h3>
              <div className="space-y-2">
                {modelData.map((m) => {
                  const maxVal = modelData[0]?.value ?? 1;
                  return (
                    <div key={m.name} className="flex items-center gap-3">
                      <span className="w-32 truncate text-xs font-mono text-surface-700">{m.name}</span>
                      <div className="flex-1 h-5 rounded-full bg-surface-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-brand-500"
                          style={{ width: `${(m.value / maxVal) * 100}%` }}
                        />
                      </div>
                      <span className="w-16 text-right font-mono text-xs font-medium">{formatCurrency(m.value)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {agentData.length > 0 && (
            <div className="stat-card">
              <h3 className="mb-4 text-sm font-semibold text-surface-900">By Agent</h3>
              <div className="space-y-2">
                {agentData.map((a) => {
                  const maxVal = agentData[0]?.value ?? 1;
                  return (
                    <div key={a.name} className="flex items-center gap-3">
                      <span className="w-32 truncate text-xs font-medium text-surface-700">{a.name}</span>
                      <div className="flex-1 h-5 rounded-full bg-surface-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-violet-500"
                          style={{ width: `${(a.value / maxVal) * 100}%` }}
                        />
                      </div>
                      <span className="w-16 text-right font-mono text-xs font-medium">{formatCurrency(a.value)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
