"use client";

import { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/layout/header";
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  Plus,
  X,
  Trash2,
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";

interface AlertData {
  id: string;
  name: string;
  agentId: string | null;
  agentName: string | null;
  budgetUsd: number;
  periodType: string;
  isActive: boolean;
  currentSpend: number;
  percentUsed: number;
  isOver: boolean;
  createdAt: string;
}

interface AgentOption {
  id: string;
  name: string;
}

interface CreateAlertForm {
  name: string;
  agentId: string;
  budgetUsd: string;
  periodType: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [agents, setAgents] = useState<AgentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<CreateAlertForm>({
    name: "",
    agentId: "",
    budgetUsd: "",
    periodType: "daily",
  });

  const fetchAlerts = useCallback(async () => {
    try {
      const [alertsRes, agentsRes] = await Promise.all([
        fetch("/api/alerts"),
        fetch("/api/agents"),
      ]);
      if (alertsRes.ok) setAlerts(await alertsRes.json());
      if (agentsRes.ok) {
        const agentList = await agentsRes.json();
        setAgents(agentList.map((a: AgentOption) => ({ id: a.id, name: a.name })));
      }
    } catch (err) {
      console.error("Alerts fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleCreate = async () => {
    const budget = parseFloat(form.budgetUsd);
    if (!form.name.trim() || isNaN(budget) || budget <= 0) return;
    setCreating(true);
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          agentId: form.agentId || undefined,
          budgetUsd: budget,
          periodType: form.periodType,
        }),
      });
      if (!res.ok) throw new Error("Failed to create alert");
      setForm({ name: "", agentId: "", budgetUsd: "", periodType: "daily" });
      setShowCreate(false);
      await fetchAlerts();
    } catch (err) {
      console.error("Create alert error:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/alerts?id=${id}`, { method: "DELETE" });
      if (res.ok) await fetchAlerts();
    } catch (err) {
      console.error("Delete alert error:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  const overBudget = alerts.filter((a) => a.isOver);
  const nearBudget = alerts.filter((a) => !a.isOver && a.percentUsed > 80);
  const healthy = alerts.filter((a) => !a.isOver && a.percentUsed <= 80);

  return (
    <div>
      <Header title="Budget Alerts" subtitle={`${alerts.length} alerts configured`} />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            {overBudget.length > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                <AlertTriangle className="h-3 w-3" />
                {overBudget.length} over budget
              </span>
            )}
            {nearBudget.length > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                {nearBudget.length} approaching limit
              </span>
            )}
            {healthy.length > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                <CheckCircle className="h-3 w-3" />
                {healthy.length} healthy
              </span>
            )}
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-500"
          >
            <Plus className="h-4 w-4" />
            New Alert
          </button>
        </div>

        {showCreate && (
          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-surface-900">Create Budget Alert</h3>
              <button onClick={() => setShowCreate(false)} className="text-surface-700/40 hover:text-surface-700">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-surface-700">Alert Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Daily LLM budget"
                  className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-surface-700">Agent (optional)</label>
                <select
                  value={form.agentId}
                  onChange={(e) => setForm({ ...form, agentId: e.target.value })}
                  className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                >
                  <option value="">All agents (global)</option>
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-surface-700">Budget (USD) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={form.budgetUsd}
                  onChange={(e) => setForm({ ...form, budgetUsd: e.target.value })}
                  placeholder="10.00"
                  className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-surface-700">Period *</label>
                <select
                  value={form.periodType}
                  onChange={(e) => setForm({ ...form, periodType: e.target.value })}
                  className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleCreate}
                disabled={!form.name.trim() || !form.budgetUsd || creating}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-500 disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Alert"}
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={cn(
                "stat-card flex items-center justify-between",
                alert.isOver && "border-red-200 bg-red-50/30"
              )}
            >
              <div className="flex items-center gap-4">
                {alert.isOver ? (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  </div>
                ) : alert.percentUsed > 80 ? (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-surface-900">{alert.name}</p>
                  <p className="text-xs text-surface-700/50">
                    {alert.agentName ?? "All agents"} &middot; {alert.periodType} &middot;{" "}
                    {formatCurrency(alert.budgetUsd)} budget
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="font-mono text-sm font-medium text-surface-900">
                    {formatCurrency(alert.currentSpend)} / {formatCurrency(alert.budgetUsd)}
                  </p>
                  <div className="mt-1.5 h-2 w-32 overflow-hidden rounded-full bg-surface-200">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        alert.isOver
                          ? "bg-red-500"
                          : alert.percentUsed > 80
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                      )}
                      style={{ width: `${Math.min(alert.percentUsed, 100)}%` }}
                    />
                  </div>
                  <p className="mt-0.5 text-[11px] text-surface-700/50">
                    {alert.percentUsed.toFixed(1)}% used
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(alert.id)}
                  className="rounded-lg p-2 text-surface-700/30 transition-colors hover:bg-red-50 hover:text-red-500"
                  title="Delete alert"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {alerts.length === 0 && (
            <div className="stat-card flex h-48 items-center justify-center">
              <div className="text-center">
                <Bell className="mx-auto h-8 w-8 text-surface-700/20" />
                <p className="mt-2 text-sm text-surface-700/50">No budget alerts configured yet.</p>
                <button
                  onClick={() => setShowCreate(true)}
                  className="mt-3 text-sm font-medium text-brand-600 hover:text-brand-500"
                >
                  Create your first alert
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
