"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  LayoutDashboard,
  Bot,
  Receipt,
  Bell,
  Settings,
  Code2,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/agents", label: "Agents", icon: Bot },
  { href: "/dashboard/costs", label: "Cost Explorer", icon: Receipt },
  { href: "/dashboard/alerts", label: "Budget Alerts", icon: Bell },
  { href: "/dashboard/integrate", label: "Integrate", icon: Code2 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

interface SessionUser {
  email: string;
  name: string | null;
  role: string;
  plan: string;
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => { if (d.user) setUser(d.user); })
      .catch(() => {});
  }, []);

  const handleSignOut = useCallback(async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/auth/signin");
    router.refresh();
  }, [router]);

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-60 flex-col border-r border-surface-200 bg-white">
      <div className="flex h-16 items-center gap-2.5 border-b border-surface-200 px-5">
        <svg className="h-8 w-8 shrink-0" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="sb-flame" x1="0.5" y1="1" x2="0.5" y2="0">
              <stop offset="0%" stopColor="#4f46e5"/>
              <stop offset="100%" stopColor="#818cf8"/>
            </linearGradient>
          </defs>
          <path d="M256 42c0 0-144 138-144 270c0 79.5 64.5 158 144 158s144-78.5 144-158C400 180 256 42 256 42z" fill="url(#sb-flame)"/>
          <path d="M256 220c0 0-68 72-68 128c0 42 28 76 68 76s68-34 68-76C324 292 256 220 256 220z" fill="#e0e7ff"/>
          <rect x="230" y="320" width="12" height="36" rx="3" fill="#4f46e5" opacity="0.5"/>
          <rect x="250" y="300" width="12" height="56" rx="3" fill="#4f46e5" opacity="0.6"/>
          <rect x="270" y="310" width="12" height="46" rx="3" fill="#4f46e5" opacity="0.5"/>
        </svg>
        <div>
          <span className="text-sm font-semibold text-surface-900">AgentBurn</span>
          <span className="block text-[10px] font-medium uppercase tracking-wider text-surface-700/50">
            Burn Rate Tracker
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-50 text-brand-700"
                  : "text-surface-700 hover:bg-surface-100 hover:text-surface-900"
              )}
            >
              <item.icon className={cn("h-4 w-4", isActive ? "text-brand-600" : "text-surface-700/60")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-surface-200 p-3">
        {user ? (
          <div className="space-y-2">
            <div className="rounded-lg bg-surface-50 px-3 py-2">
              <p className="truncate text-xs font-medium text-surface-900">
                {user.name || user.email}
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-surface-700/60">
                <span className="capitalize">{user.plan}</span>
                {user.role === "admin" && (
                  <span className="rounded bg-brand-50 px-1 py-0.5 text-[9px] font-semibold uppercase text-brand-600">
                    Admin
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-surface-700/60 transition-colors hover:bg-surface-100 hover:text-surface-900"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        ) : (
          <div className="rounded-lg bg-surface-50 p-3">
            <p className="text-xs font-medium text-surface-700">Loading...</p>
          </div>
        )}
      </div>
    </aside>
  );
}
