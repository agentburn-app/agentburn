"use client";

import Link from "next/link";
import { getAllPosts, type BlogPost } from "@/lib/blog";
import {
  ArrowRight,
  Clock,
  Tag,
  Flame,
  BarChart3,
  BookOpen,
  GitCompare,
  FileText,
} from "lucide-react";

const categoryConfig: Record<
  BlogPost["category"],
  { label: string; icon: typeof Flame; color: string }
> = {
  product: {
    label: "Product",
    icon: Flame,
    color: "bg-indigo-500/10 text-indigo-400",
  },
  comparison: {
    label: "Comparison",
    icon: GitCompare,
    color: "bg-amber-500/10 text-amber-400",
  },
  guide: {
    label: "Guide",
    icon: BookOpen,
    color: "bg-emerald-500/10 text-emerald-400",
  },
  "case-study": {
    label: "Case Study",
    icon: FileText,
    color: "bg-rose-500/10 text-rose-400",
  },
};

function PostCard({ post }: { post: BlogPost }) {
  const cat = categoryConfig[post.category];
  const Icon = cat.icon;

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all hover:border-indigo-500/30 hover:bg-white/[0.04]"
    >
      <div className="mb-3 flex items-center gap-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${cat.color}`}
        >
          <Icon className="h-3 w-3" />
          {cat.label}
        </span>
        <span className="text-xs text-zinc-500">
          {new Date(post.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>

      <h2 className="mb-2 text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors">
        {post.title}
      </h2>

      <p className="mb-4 text-sm text-zinc-400 line-clamp-2">
        {post.description}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          <Clock className="h-3 w-3" />
          {post.readTime} min read
        </div>
        <span className="flex items-center gap-1 text-xs font-medium text-indigo-400 opacity-0 transition-opacity group-hover:opacity-100">
          Read more <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}

export default function BlogPage() {
  const posts = getAllPosts();
  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0A0A0F]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <svg
              width="28"
              height="28"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient
                  id="bg"
                  x1="32"
                  y1="0"
                  x2="32"
                  y2="64"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#818cf8" />
                  <stop offset="1" stopColor="#4f46e5" />
                </linearGradient>
              </defs>
              <path
                d="M32 4C32 4 12 24 12 38a20 20 0 0 0 40 0C52 24 32 4 32 4Z"
                fill="url(#bg)"
              />
              <path
                d="M32 30c0 0-8 8-8 14a8 8 0 0 0 16 0c0-6-8-14-8-14Z"
                fill="#c7d2fe"
                opacity="0.4"
              />
              <rect x="26" y="38" width="3" height="8" rx="1" fill="#818cf8" />
              <rect x="30.5" y="35" width="3" height="11" rx="1" fill="#818cf8" />
              <rect x="35" y="32" width="3" height="14" rx="1" fill="#818cf8" />
            </svg>
            <span className="text-lg font-bold text-white">AgentBurn</span>
          </Link>
          <div className="flex items-center gap-6 text-sm">
            <Link
              href="/"
              className="text-zinc-400 hover:text-white transition"
            >
              Home
            </Link>
            <Link href="/blog" className="text-white font-medium">
              Blog
            </Link>
            <Link
              href="/dashboard"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500 transition"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-16">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-white">
            AgentBurn Blog
          </h1>
          <p className="text-lg text-zinc-400">
            Guides, comparisons, and insights on AI agent cost management
          </p>
        </div>

        {/* Category filters */}
        <div className="mb-10 flex flex-wrap justify-center gap-3">
          {Object.entries(categoryConfig).map(([key, val]) => {
            const Icon = val.icon;
            return (
              <span
                key={key}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${val.color}`}
              >
                <Icon className="h-3 w-3" />
                {val.label}
              </span>
            );
          })}
        </div>

        {/* Featured post */}
        {featured && (
          <Link
            href={`/blog/${featured.slug}`}
            className="group mb-12 block rounded-2xl border border-white/[0.06] bg-gradient-to-br from-indigo-500/5 to-transparent p-8 transition-all hover:border-indigo-500/30"
          >
            <div className="mb-3 flex items-center gap-3">
              <span className="rounded-full bg-indigo-500/20 px-3 py-0.5 text-xs font-medium text-indigo-400">
                Latest
              </span>
              <span className="text-xs text-zinc-500">
                {new Date(featured.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <h2 className="mb-3 text-2xl font-bold text-white group-hover:text-indigo-400 transition-colors">
              {featured.title}
            </h2>
            <p className="mb-4 text-zinc-400">{featured.description}</p>
            <span className="flex items-center gap-1 text-sm font-medium text-indigo-400">
              Read article <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        )}

        {/* Post grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 sm:flex-row">
          <p className="text-sm text-zinc-500">
            &copy; {new Date().getFullYear()} AgentBurn. Open-source AI cost intelligence.
          </p>
          <nav className="flex gap-4 text-xs text-zinc-500">
            <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition">Terms</Link>
            <a href="mailto:support@agentburn.dev" className="hover:text-white transition">Contact</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
