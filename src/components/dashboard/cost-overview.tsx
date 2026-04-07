"use client";

import { DollarSign, TrendingUp, TrendingDown, Bot, Activity } from "lucide-react";
import { formatCurrency, formatNumber, cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  change?: number | null;
  icon: React.ReactNode;
  accent?: string;
}

function StatCard({ label, value, change, icon, accent = "bg-brand-50 text-brand-600" }: StatCardProps) {
  return (
    <div className="stat-card flex items-start justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-surface-700/50">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-surface-900">{value}</p>
        {change !== undefined && change !== null && (
          <div className={cn("mt-1.5 flex items-center gap-1 text-xs font-medium", change >= 0 ? "text-red-500" : "text-emerald-500")}>
            {change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(change).toFixed(1)}% vs prev period
          </div>
        )}
      </div>
      <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", accent)}>
        {icon}
      </div>
    </div>
  );
}

interface CostOverviewProps {
  totalCostToday: number;
  totalCostWeek: number;
  totalCostMonth: number;
  costChangePercent: number | null;
  activeAgents: number;
  totalEvents: number;
}

export function CostOverview({
  totalCostToday,
  totalCostWeek,
  totalCostMonth,
  costChangePercent,
  activeAgents,
  totalEvents,
}: CostOverviewProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Today's Spend"
        value={formatCurrency(totalCostToday)}
        icon={<DollarSign className="h-5 w-5" />}
      />
      <StatCard
        label="7-Day Spend"
        value={formatCurrency(totalCostWeek)}
        icon={<DollarSign className="h-5 w-5" />}
        accent="bg-violet-50 text-violet-600"
      />
      <StatCard
        label="30-Day Spend"
        value={formatCurrency(totalCostMonth)}
        change={costChangePercent}
        icon={<Activity className="h-5 w-5" />}
        accent="bg-amber-50 text-amber-600"
      />
      <StatCard
        label="Active Agents"
        value={`${activeAgents}`}
        icon={<Bot className="h-5 w-5" />}
        accent="bg-emerald-50 text-emerald-600"
      />
    </div>
  );
}
