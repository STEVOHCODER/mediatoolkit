import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How MediaToolkit handles diagnostic input and uploaded logs.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <article className="section-shell max-w-3xl py-20">
      <span className="eyebrow">Privacy</span>
      <h1 className="mt-4 text-4xl font-semibold">Diagnostic data should stay diagnostic.</h1>
      <div className="article-copy mt-10 grid gap-8">
        <section>
          <h2 className="text-xl font-semibold">Before you submit</h2>
          <p className="mt-3">
            Remove passwords, API keys, access tokens, personal data, and production secrets
            from logs and stack traces. MediaToolkit limits input length, but it cannot identify
            every secret automatically.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold">AI analysis</h2>
          <p className="mt-3">
            When an OpenAI key is configured, submitted diagnostic text is sent to the
            configured OpenAI model for analysis. Without a key, the application uses its
            local fingerprint engine.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold">Uploaded logs</h2>
          <p className="mt-3">
            File uploads use short-lived signed Cloudflare R2 URLs. Production operators
            should configure an R2 lifecycle rule to delete logs automatically after the
            retention period they publish to users.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold">Advertising and cookies</h2>
          <p className="mt-3">
            When advertising is enabled, Google AdSense may use cookies or similar
            technologies to serve and measure ads. The production operator is responsible
            for configuring the required consent platform and regional privacy controls
            before enabling personalized advertising.
          </p>
        </section>
      </div>
    </article>
  );
}
