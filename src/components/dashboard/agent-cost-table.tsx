"use client";

import { Bot } from "lucide-react";
import { formatCurrency, formatTokens, getProviderColor } from "@/lib/utils";
import type { AgentSummary } from "@/types";

interface AgentCostTableProps {
  agents: AgentSummary[];
}

export function AgentCostTable({ agents }: AgentCostTableProps) {
  if (agents.length === 0) {
    return (
      <div className="stat-card flex h-48 items-center justify-center">
        <p className="text-sm text-surface-700/50">No agents registered yet.</p>
      </div>
    );
  }

  return (
    <div className="stat-card overflow-hidden p-0">
      <div className="border-b border-surface-200 px-5 py-3">
        <h3 className="text-sm font-semibold text-surface-900">Top Agents by Cost</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-100 text-left text-xs font-medium uppercase tracking-wider text-surface-700/50">
              <th className="px-5 py-3">Agent</th>
              <th className="px-5 py-3">Total Cost</th>
              <th className="px-5 py-3">Events</th>
              <th className="px-5 py-3">Tokens (In/Out)</th>
              <th className="px-5 py-3">Providers</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {agents.map((agent) => (
              <tr key={agent.id} className="transition-colors hover:bg-surface-50/50">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-50">
                      <Bot className="h-3.5 w-3.5 text-brand-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-surface-900">{agent.name}</p>
                      {agent.projectId && (
                        <p className="text-[11px] text-surface-700/50">{agent.projectId}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span className="font-mono text-sm font-semibold text-surface-900">
                    {formatCurrency(agent.totalCost)}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className="text-sm text-surface-700">{agent.eventCount.toLocaleString()}</span>
                </td>
                <td className="px-5 py-3">
                  <span className="font-mono text-xs text-surface-700">
                    {formatTokens(agent.totalInputTokens)} / {formatTokens(agent.totalOutputTokens)}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex gap-1.5">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
