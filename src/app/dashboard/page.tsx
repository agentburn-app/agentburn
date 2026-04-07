"use client";

import { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { CostOverview } from "@/components/dashboard/cost-overview";
import { CostChart } from "@/components/dashboard/cost-chart";
import { ProviderBreakdown } from "@/components/dashboard/provider-breakdown";
import { AgentCostTable } from "@/components/dashboard/agent-cost-table";
import { BudgetAlerts } from "@/components/dashboard/budget-alerts";
import type { DashboardData } from "@/types";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Failed to fetch dashboard data");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(), 30_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-sm text-surface-700/60">Failed to load dashboard data.</p>
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Overview"
        subtitle="Real-time cost intelligence across your agent infrastructure"
        onRefresh={() => fetchData(true)}
        refreshing={refreshing}
      />
      <div className="space-y-6 p-6">
        <CostOverview
          totalCostToday={data.totalCostToday}
          totalCostWeek={data.totalCostWeek}
          totalCostMonth={data.totalCostMonth}
          costChangePercent={data.costChangePercent}
          activeAgents={data.activeAgents}
          totalEvents={data.totalEvents}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CostChart data={data.costTimeSeries} />
          </div>
          <div>
            <ProviderBreakdown costByProvider={data.costByProvider} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AgentCostTable agents={data.topAgents} />
          </div>
          <div>
            <BudgetAlerts alerts={data.budgetAlerts} />
          </div>
        </div>
      </div>
    </div>
  );
}
