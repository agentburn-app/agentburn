"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { TimeSeriesPoint } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface CostChartProps {
  data: TimeSeriesPoint[];
}

export function CostChart({ data }: CostChartProps) {
  if (data.length === 0) {
    return (
      <div className="stat-card flex h-80 items-center justify-center">
        <p className="text-sm text-surface-700/50">No cost data yet. Start ingesting events.</p>
      </div>
    );
  }

  return (
    <div className="stat-card">
      <h3 className="mb-4 text-sm font-semibold text-surface-900">Cost Over Time (30 days)</h3>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
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
          <YAxis
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickFormatter={(v: number) => formatCurrency(v)}
            width={65}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(value: number) => [formatCurrency(value), "Cost"]}
            labelFormatter={(label: string) => {
              const date = new Date(label + "T00:00:00");
              return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
            }}
          />
          <Area
            type="monotone"
            dataKey="cost"
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#costGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
