import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "MediaToolkit publishes verified programming error guides, debugging tutorials, and interactive labs that teach you to fix real failures.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About MediaToolkit",
    description:
      "Why MediaToolkit exists: evidence-based error guides and hands-on debugging practice.",
    url: "/about",
  },
};

export default function AboutPage() {
  return (
    <article className="section-shell max-w-3xl py-20">
      <span className="eyebrow">About</span>
      <h1 className="mt-4 text-4xl font-semibold">Fix the cause, not the symptom.</h1>
      <div className="article-copy mt-10 grid gap-8">
        <section>
          <h2 className="text-xl font-semibold">What MediaToolkit is</h2>
          <p className="mt-3">
            MediaToolkit is a knowledge base for developers who are staring at a
            failing build, a stack trace, or an error message they have never seen
            before. Every guide starts from a real error, explains why it happens,
            and gives you commands and code you can run to verify the fix.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold">How the content is produced</h2>
          <p className="mt-3">
            Articles are written and reviewed against reproducible examples. Each
            error guide carries the causes, a quick fix, ranked debugging methods,
            environment-specific alternatives, working code samples, frequently
            asked questions, and references to official documentation. Guides are
            re-verified on a schedule so commands stay current.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold">What you can do here</h2>
          <p className="mt-3">
            Search an exact error message or paste a stack trace to fingerprint it,
            read the verified fix, then move to the interactive labs and playground
            to reproduce the failure yourself. You can also ask a focused
            programming question and compare answers from other developers.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold">Editorial standards</h2>
          <p className="mt-3">
            We do not publish unverified AI output as a fix. Commands are executed
            before they are recommended, examples are kept minimal and complete,
            and corrections are applied when a toolchain change breaks an older
            instruction. Advertising on the site is clearly labeled and never
            influences article content or rankings.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold">Contact</h2>
          <p className="mt-3">
            Found an incorrect command, an outdated step, or a guide that is missing
            your error? Write to{" "}
            <a href="mailto:hello@mediatoolkit.tech" className="text-accent underline">
              hello@mediatoolkit.tech
            </a>{" "}
            and include the error text, your environment, and the link to the page.
          </p>
        </section>
      </div>
    </article>
  );
}
