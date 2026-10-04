import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of use",
  description:
    "The rules for using MediaToolkit: acceptable use, content accuracy, advertising, and liability limits.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms of use - MediaToolkit",
    description: "The rules for using MediaToolkit and its content.",
    url: "/terms",
  },
};

export default function TermsPage() {
  return (
    <article className="section-shell max-w-3xl py-20">
      <span className="eyebrow">Terms</span>
      <h1 className="mt-4 text-4xl font-semibold">Terms of use.</h1>
      <div className="article-copy mt-10 grid gap-8">
        <section>
          <h2 className="text-xl font-semibold">1. Acceptance</h2>
          <p className="mt-3">
            By using MediaToolkit you agree to these terms and to the{" "}
            <a href="/privacy" className="text-accent underline">
              privacy policy
            </a>
            . If you do not agree, do not use the site.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold">2. What we provide</h2>
          <p className="mt-3">
            MediaToolkit publishes programming error guides, tutorials, searchable
            questions, and interactive debugging labs. Features that depend on
            external services, such as AI-assisted diagnosis or sandboxed code
            execution, may be unavailable when those services are not configured or
            are rate limited.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold">3. Content accuracy</h2>
          <p className="mt-3">
            Articles are reviewed against reproducible examples, but toolchains
            change and environments differ. Commands and code are provided{" "}
            <strong>as is</strong> for educational purposes. Test anything from this
            site in a safe environment before running it against production systems,
            and never run a command you do not understand.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold">4. Acceptable use</h2>
          <p className="mt-3">
            Do not use the site to distribute malware, attempt unauthorized access
            to systems you do not own, overload the service with automated traffic,
            scrape content at scale, misrepresent authorship, or submit material
            that is unlawful or infringes the rights of others. We may restrict
            access to protect the service and its users.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold">5. Your submissions</h2>
          <p className="mt-3">
            Questions, code, and diagnostic text you submit remain yours. You grant
            us the limited permission needed to display and operate them on the
            site. Remove secrets and personal data before submitting anything, as
            described in the privacy policy.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold">6. Advertising</h2>
          <p className="mt-3">
            The site may display advertising served by Google AdSense. Ads are
            labeled and do not influence editorial decisions. Where required by
            law, personalized advertising is served only after consent is captured
            by a certified consent platform.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold">7. Liability</h2>
          <p className="mt-3">
            To the maximum extent permitted by law, MediaToolkit is not liable for
            damages arising from reliance on its content, from interruption of the
            service, or from third-party sites linked from it. Nothing in these
            terms limits liability that cannot be limited by law.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold">8. Changes and contact</h2>
          <p className="mt-3">
            We may update these terms; the date on this page reflects the latest
            revision. Questions about these terms go to{" "}
            <a href="mailto:hello@mediatoolkit.tech" className="text-accent underline">
              hello@mediatoolkit.tech
            </a>
            .
          </p>
        </section>
      </div>
    </article>
  );
}
