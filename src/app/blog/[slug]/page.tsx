import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllPosts,
  getPostBySlug,
  type BlogPost,
} from "@/lib/blog";
import { ArrowLeft, Clock, Tag } from "lucide-react";

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Post Not Found" };

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://agentburn.dev";

  return {
    title: `${post.title} | AgentBurn Blog`,
    description: post.description,
    keywords: post.tags,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      url: `${baseUrl}/blog/${post.slug}`,
      siteName: "AgentBurn",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
    alternates: {
      canonical: `${baseUrl}/blog/${post.slug}`,
    },
  };
}

function RelatedPosts({
  current,
  posts,
}: {
  current: BlogPost;
  posts: BlogPost[];
}) {
  const related = posts
    .filter(
      (p) =>
        p.slug !== current.slug &&
        (p.category === current.category ||
          p.tags.some((t) => current.tags.includes(t)))
    )
    .slice(0, 3);

  if (related.length === 0) return null;

  return (
    <section className="mt-16 border-t border-white/[0.06] pt-12">
      <h2 className="mb-6 text-xl font-bold text-white">Related Articles</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {related.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 transition-all hover:border-indigo-500/30"
          >
            <h3 className="mb-2 text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors line-clamp-2">
              {post.title}
            </h3>
            <p className="text-xs text-zinc-500">
              {post.readTime} min read
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const allPosts = getAllPosts();
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://agentburn.dev";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { "@type": "Organization", name: "AgentBurn" },
    publisher: {
      "@type": "Organization",
      name: "AgentBurn",
      url: baseUrl,
    },
    url: `${baseUrl}/blog/${post.slug}`,
    keywords: post.tags.join(", "),
  };

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
              <rect
                x="30.5"
                y="35"
                width="3"
                height="11"
                rx="1"
                fill="#818cf8"
              />
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
            <Link
              href="/blog"
              className="text-zinc-400 hover:text-white transition"
            >
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

      <main className="mx-auto max-w-3xl px-6 py-12">
        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Breadcrumb */}
        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-indigo-400 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Blog
        </Link>

        {/* Post header */}
        <header className="mb-10">
          <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-zinc-500">
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </time>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {post.readTime} min read
            </span>
            <span>·</span>
            <span className="capitalize">
              {post.category.replace("-", " ")}
            </span>
          </div>
          <h1 className="mb-4 text-3xl font-bold leading-tight text-white md:text-4xl">
            {post.title}
          </h1>
          <p className="text-lg text-zinc-400">{post.description}</p>
        </header>

        {/* Post content */}
        <article
          className="prose prose-invert prose-zinc max-w-none
            prose-headings:text-white prose-headings:font-bold
            prose-h2:mt-10 prose-h2:mb-4 prose-h2:text-xl
            prose-h3:mt-6 prose-h3:mb-3 prose-h3:text-lg
            prose-p:text-zinc-300 prose-p:leading-relaxed
            prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-white
            prose-code:text-indigo-300 prose-code:bg-white/[0.06] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
            prose-pre:bg-[#12121a] prose-pre:border prose-pre:border-white/[0.06] prose-pre:rounded-xl
            prose-li:text-zinc-300
            prose-table:text-sm
            prose-th:text-white prose-th:font-semibold prose-th:border-white/10 prose-th:px-3 prose-th:py-2
            prose-td:text-zinc-300 prose-td:border-white/[0.06] prose-td:px-3 prose-td:py-2
            prose-ul:my-4 prose-ol:my-4"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        <div className="mt-10 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-white/[0.04] px-3 py-1 text-xs text-zinc-400"
            >
              <Tag className="h-3 w-3" />
              {tag}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-8 text-center">
          <h3 className="mb-2 text-lg font-bold text-white">
            Start tracking your AI agent costs
          </h3>
          <p className="mb-4 text-sm text-zinc-400">
            Open-source. Self-hosted. Free forever for the core engine.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 transition"
            >
              Try the Dashboard
            </Link>
            <a
              href="https://github.com/agentburn-io/agentburn"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:bg-white/[0.04] transition"
            >
              View on GitHub
            </a>
          </div>
        </div>

        {/* Related posts */}
        <RelatedPosts current={post} posts={allPosts} />
      </main>

      <footer className="border-t border-white/[0.06] py-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-3 px-6 sm:flex-row">
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
