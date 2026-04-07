"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency, getProviderColor } from "@/lib/utils";

interface ProviderBreakdownProps {
  costByProvider: Record<string, number>;
}

export function ProviderBreakdown({ costByProvider }: ProviderBreakdownProps) {
  const data = Object.entries(costByProvider)
    .map(([name, value]) => ({ name, value: Math.round(value * 10000) / 10000 }))
    .sort((a, b) => b.value - a.value);

  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (data.length === 0) {
    return (
      <div className="stat-card flex h-80 items-center justify-center">
        <p className="text-sm text-surface-700/50">No provider data yet.</p>
      </div>
    );
  }

  return (
    <div className="stat-card">
      <h3 className="mb-4 text-sm font-semibold text-surface-900">Spend by Provider</h3>
      <div className="flex items-center gap-6">
        <ResponsiveContainer width={160} height={160}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={72}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={getProviderColor(entry.name)} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-2">
          {data.map((entry) => (
            <div key={entry.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: getProviderColor(entry.name) }}
                />
                <span className="font-medium capitalize text-surface-800">{entry.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-surface-700/50">
                  {total > 0 ? ((entry.value / total) * 100).toFixed(1) : 0}%
                </span>
                <span className="font-mono text-xs font-medium text-surface-900">
                  {formatCurrency(entry.value)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
