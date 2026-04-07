"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Github, Menu, X } from "lucide-react";

export function Nav() {
  const [open, setOpen] = useState(false);

  // Close mobile menu on route change or escape key
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const navLinks = [
    { href: "#product", label: "Product" },
    { href: "#pricing", label: "Pricing" },
    { href: "/dashboard/integrate", label: "Docs" },
    { href: "/blog", label: "Blog" },
  ];

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/[0.06] bg-surface-950/80 backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 text-[15px] font-semibold text-white">
          <svg className="h-7 w-7" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="nav-flame" x1="0.5" y1="1" x2="0.5" y2="0">
                <stop offset="0%" stopColor="#4f46e5" />
                <stop offset="100%" stopColor="#818cf8" />
              </linearGradient>
            </defs>
            <path d="M256 42c0 0-144 138-144 270c0 79.5 64.5 158 144 158s144-78.5 144-158C400 180 256 42 256 42z" fill="url(#nav-flame)" />
            <path d="M256 220c0 0-68 72-68 128c0 42 28 76 68 76s68-34 68-76C324 292 256 220 256 220z" fill="#e0e7ff" />
            <rect x="230" y="320" width="12" height="36" rx="3" fill="#4f46e5" opacity="0.5" />
            <rect x="250" y="300" width="12" height="56" rx="3" fill="#4f46e5" opacity="0.6" />
            <rect x="270" y="310" width="12" height="46" rx="3" fill="#4f46e5" opacity="0.5" />
          </svg>
          AgentBurn
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 sm:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[13px] text-surface-200/50 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="https://github.com/agentburn-app/agentburn"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] text-surface-200/50 transition-colors hover:text-white"
          >
            <Github className="h-4 w-4" />
          </Link>
          <Link
            href="/auth/signin"
            className="text-[13px] text-surface-200/50 transition-colors hover:text-white"
          >
            Sign in
          </Link>
          <Link
            href="/auth/signup"
            className="rounded-lg bg-white px-4 py-1.5 text-[13px] font-medium text-surface-950 transition-colors hover:bg-surface-100"
          >
            Get started
          </Link>
        </div>

        {/* Mobile hamburger button */}
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center justify-center sm:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            <Menu className="h-6 w-6 text-white" />
          )}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {open && (
        <div className="fixed inset-0 top-14 z-40 bg-surface-950/95 backdrop-blur-xl sm:hidden">
          <div className="flex flex-col gap-1 px-6 py-6">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-4 py-3 text-base font-medium text-surface-200/70 transition-colors hover:bg-surface-800 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-3 border-surface-800" />
            <Link
              href="/auth/signin"
              onClick={() => setOpen(false)}
              className="rounded-lg px-4 py-3 text-base font-medium text-surface-200/70 transition-colors hover:bg-surface-800 hover:text-white"
            >
              Sign in
            </Link>
            <Link
              href="/auth/signup"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-lg bg-white px-4 py-3 text-center text-base font-medium text-surface-950 transition-colors hover:bg-surface-100"
            >
              Get started free
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
