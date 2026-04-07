import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | AgentBurn",
  description:
    "AgentBurn privacy policy — how we handle your data, what we collect, and your rights.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0A0A0F]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="text-lg font-bold text-white">
            AgentBurn
          </Link>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/" className="text-zinc-400 hover:text-white transition">Home</Link>
            <Link href="/blog" className="text-zinc-400 hover:text-white transition">Blog</Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="mb-2 text-3xl font-bold text-white">Privacy Policy</h1>
        <p className="mb-10 text-sm text-zinc-500">Last updated: April 6, 2025</p>

        <div className="prose prose-invert prose-zinc max-w-none prose-headings:text-white prose-p:text-zinc-300 prose-li:text-zinc-300 prose-a:text-indigo-400 prose-strong:text-white prose-h2:mt-10 prose-h2:mb-4 prose-h2:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-h3:text-lg">
          <h2>1. Overview</h2>
          <p>
            AgentBurn (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates the website at{" "}
            <strong>agentburn.dev</strong> and provides an open-source AI agent cost tracking
            platform. This Privacy Policy describes what information we collect, how we use it,
            and your choices regarding that information.
          </p>

          <h2>2. Information We Collect</h2>

          <h3>2.1 Data You Send via the API</h3>
          <p>
            When you use the AgentBurn ingest API, you send us cost event data including agent
            identifiers, provider names, model names, token counts, cost amounts, and optional
            metadata. This data is stored in the database associated with your AgentBurn instance.
          </p>

          <h3>2.2 Self-Hosted Instances</h3>
          <p>
            If you self-host AgentBurn, all data stays on your own infrastructure. We have no
            access to your self-hosted data. This privacy policy applies only to the hosted
            service at agentburn.dev.
          </p>

          <h3>2.3 Website Analytics</h3>
          <p>
            We may use Google Analytics to collect anonymous usage data about visitors to
            agentburn.dev, including page views, referral sources, and device type. This data
            is aggregated and cannot identify individual users. You can opt out of Google
            Analytics by using a browser extension or disabling JavaScript.
          </p>

          <h3>2.4 Cookies</h3>
          <p>
            We use only essential cookies required for site functionality. We do not use
            advertising cookies or third-party tracking cookies.
          </p>

          <h2>3. How We Use Your Information</h2>
          <ul>
            <li>To provide and maintain the AgentBurn service</li>
            <li>To display cost dashboards and analytics based on the data you submit</li>
            <li>To send budget alert notifications when configured</li>
            <li>To improve the service based on anonymous, aggregated usage patterns</li>
          </ul>

          <h2>4. Data Sharing</h2>
          <p>
            We do not sell, rent, or share your data with third parties. We do not use your
            submitted cost data for any purpose other than providing the service to you.
          </p>
          <p>
            We may disclose information if required by law or to protect the safety and
            security of our users and service.
          </p>

          <h2>5. Data Retention</h2>
          <p>
            Cost event data is retained for as long as your account is active. You may delete
            your data at any time by removing records from the database. For self-hosted
            instances, data retention is entirely under your control.
          </p>

          <h2>6. Data Security</h2>
          <p>
            We use industry-standard security measures including encrypted connections (TLS),
            secure database access, and API key authentication for the ingest endpoint. However,
            no method of transmission over the Internet is 100% secure.
          </p>

          <h2>7. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access the data you have submitted</li>
            <li>Request deletion of your data</li>
            <li>Export your data at any time via the API</li>
            <li>Self-host the platform to maintain full control over your data</li>
          </ul>

          <h2>8. Children&apos;s Privacy</h2>
          <p>
            AgentBurn is not directed at children under 13. We do not knowingly collect
            personal information from children.
          </p>

          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Changes will be posted on this
            page with an updated revision date.
          </p>

          <h2>10. Contact</h2>
          <p>
            If you have questions about this Privacy Policy, contact us at{" "}
            <a href="mailto:support@agentburn.dev">support@agentburn.dev</a>.
          </p>
        </div>
      </main>

      <footer className="border-t border-white/[0.06] py-8 text-center text-sm text-zinc-500">
        &copy; {new Date().getFullYear()} AgentBurn. Open-source AI cost intelligence.
      </footer>
    </div>
  );
}
