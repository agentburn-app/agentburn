"use client";

import { AlertTriangle, CheckCircle } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import type { BudgetAlertStatus } from "@/types";

interface BudgetAlertsProps {
  alerts: BudgetAlertStatus[];
}

export function BudgetAlerts({ alerts }: BudgetAlertsProps) {
  if (alerts.length === 0) {
    return (
      <div className="stat-card flex h-48 items-center justify-center">
        <p className="text-sm text-surface-700/50">No budget alerts configured.</p>
      </div>
    );
  }

  return (
    <div className="stat-card p-0">
      <div className="border-b border-surface-200 px-5 py-3">
        <h3 className="text-sm font-semibold text-surface-900">Budget Alerts</h3>
      </div>
      <div className="divide-y divide-surface-100">
        {alerts.map((alert) => (
          <div key={alert.id} className="flex items-center justify-between px-5 py-3">
            <div className="flex items-center gap-3">
              {alert.isOver ? (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              ) : (
                <CheckCircle className="h-4 w-4 text-emerald-500" />
              )}
              <div>
                <p className="text-sm font-medium text-surface-900">{alert.name}</p>
                <p className="text-[11px] text-surface-700/50">
                  {alert.agentName ?? "All agents"} &middot; {alert.periodType}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono text-sm font-medium text-surface-900">
                {formatCurrency(alert.currentSpend)} / {formatCurrency(alert.budgetUsd)}
              </p>
              <div className="mt-1.5 h-1.5 w-24 overflow-hidden rounded-full bg-surface-100">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    alert.percentUsed > 100
                      ? "bg-red-500"
                      : alert.percentUsed > 80
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                  )}
                  style={{ width: `${Math.min(alert.percentUsed, 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
