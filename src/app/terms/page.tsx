import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use | AgentBurn",
  description:
    "AgentBurn terms of use — rules governing access to and use of the AgentBurn platform.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
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
        <h1 className="mb-2 text-3xl font-bold text-white">Terms of Use</h1>
        <p className="mb-10 text-sm text-zinc-500">Last updated: April 6, 2025</p>

        <div className="prose prose-invert prose-zinc max-w-none prose-headings:text-white prose-p:text-zinc-300 prose-li:text-zinc-300 prose-a:text-indigo-400 prose-strong:text-white prose-h2:mt-10 prose-h2:mb-4 prose-h2:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-h3:text-lg">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using AgentBurn (&ldquo;the Service&rdquo;), operated at{" "}
            <strong>agentburn.dev</strong>, you agree to be bound by these Terms of Use. If you
            do not agree, do not use the Service.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            AgentBurn is an open-source AI agent cost tracking platform. The Service provides
            cost event ingestion via API, real-time dashboards, budget alerts, and analytics
            for AI infrastructure spending. The core software is released under the MIT License.
          </p>

          <h2>3. Use of the Service</h2>
          <p>You agree to:</p>
          <ul>
            <li>Use the Service only for lawful purposes</li>
            <li>Keep your API key confidential and not share it with unauthorized parties</li>
            <li>Not attempt to disrupt, overload, or interfere with the Service</li>
            <li>Not use the Service to transmit malicious data or code</li>
            <li>Not reverse-engineer, scrape, or abuse the hosted platform beyond normal API usage</li>
          </ul>

          <h2>4. Accounts and API Keys</h2>
          <p>
            Access to the ingest API requires an API key. You are responsible for all activity
            under your API key. If you believe your key has been compromised, rotate it
            immediately and contact us.
          </p>

          <h2>5. Self-Hosted Instances</h2>
          <p>
            The AgentBurn core is MIT-licensed open-source software. You may self-host, modify,
            and distribute it in accordance with the{" "}
            <a
              href="https://opensource.org/licenses/MIT"
              target="_blank"
              rel="noopener noreferrer"
            >
              MIT License
            </a>
            . These Terms of Use apply specifically to the hosted service at agentburn.dev.
          </p>

          <h2>6. Data Ownership</h2>
          <p>
            You retain full ownership of all data you submit to AgentBurn. We do not claim any
            intellectual property rights over your cost event data, agent configurations, or
            metadata. See our{" "}
            <Link href="/privacy">Privacy Policy</Link> for details on how we handle your data.
          </p>

          <h2>7. Service Availability</h2>
          <p>
            We aim to provide a reliable service but do not guarantee 100% uptime. The Service
            is provided &ldquo;as is&rdquo; and &ldquo;as available.&rdquo; We may perform
            maintenance, updates, or modifications that temporarily affect availability.
          </p>

          <h2>8. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, AgentBurn and its operators shall not be
            liable for any indirect, incidental, special, consequential, or punitive damages,
            including loss of profits, data, or business opportunities, arising from your use
            of the Service.
          </p>
          <p>
            AgentBurn is a cost tracking tool. We are not responsible for the costs incurred
            by your AI agents, providers, or infrastructure. The dashboards display data as
            submitted by you; we do not guarantee accuracy of cost calculations.
          </p>

          <h2>9. Termination</h2>
          <p>
            We may suspend or terminate access to the Service at any time for violations of
            these Terms. You may stop using the Service at any time. Upon termination, your
            data will be retained for 30 days and then deleted unless you request earlier
            deletion.
          </p>

          <h2>10. Intellectual Property</h2>
          <p>
            The AgentBurn name, logo, and branding are the property of AgentBurn. The open-source
            codebase is MIT-licensed. Third-party trademarks mentioned on this site (OpenAI,
            Anthropic, Google, etc.) belong to their respective owners.
          </p>

          <h2>11. Changes to Terms</h2>
          <p>
            We may modify these Terms at any time. Material changes will be communicated via
            the website. Continued use of the Service after changes constitutes acceptance of
            the updated Terms.
          </p>

          <h2>12. Governing Law</h2>
          <p>
            These Terms are governed by and construed in accordance with the laws of the United
            States. Any disputes shall be resolved in the courts of competent jurisdiction.
          </p>

          <h2>13. Contact</h2>
          <p>
            For questions about these Terms, contact us at{" "}
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
