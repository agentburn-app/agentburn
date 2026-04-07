"use client";

import { RefreshCw } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function Header({ title, subtitle, onRefresh, refreshing }: HeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-surface-200 bg-white px-6 py-4">
      <div>
        <h1 className="text-lg font-semibold text-surface-900">{title}</h1>
        {subtitle && <p className="text-sm text-surface-700/60">{subtitle}</p>}
      </div>
      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-lg border border-surface-200 px-3 py-1.5 text-sm font-medium text-surface-700 transition-colors hover:bg-surface-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      )}
    </header>
  );
}
