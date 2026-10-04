import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact the MediaToolkit team about error guides, corrections, partnerships, advertising, or privacy questions.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact MediaToolkit",
    description: "How to reach the MediaToolkit editorial team.",
    url: "/contact",
  },
};

const topics = [
  {
    title: "Corrections",
    body: "A command that fails, an outdated step, or a guide that does not match your environment. Include the page link, your OS, tool versions, and the exact output.",
  },
  {
    title: "Request a guide",
    body: "Send the full error text or stack trace and, if you can, the smallest snippet of code that reproduces it.",
  },
  {
    title: "Privacy and data",
    body: "Questions about diagnostic input, uploaded logs, cookies, or advertising consent are answered under the privacy policy.",
  },
  {
    title: "Advertising and partnerships",
    body: "Include your company, what you want to run or promote, the target audience, and your timeline.",
  },
];

export default function ContactPage() {
  return (
    <article className="section-shell max-w-3xl py-20">
      <span className="eyebrow">Contact</span>
      <h1 className="mt-4 text-4xl font-semibold">Talk to a human.</h1>
      <div className="article-copy mt-10 grid gap-8">
        <section>
          <h2 className="text-xl font-semibold">Email</h2>
          <p className="mt-3">
            The fastest way to reach us is{" "}
            <a href="mailto:hello@mediatoolkit.tech" className="text-accent underline">
              hello@mediatoolkit.tech
            </a>
            . Messages are read on business days and we aim to reply within two
            working days.
          </p>
          <p className="mt-3">
            Please do not paste production secrets, private keys, access tokens, or
            personal data into your message. Redact them first, the same way the
            privacy policy asks you to redact them before using the debugger.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold">What to include</h2>
          <div className="mt-4 grid gap-4">
            {topics.map((topic) => (
              <div key={topic.title} className="rounded-xl border border-line bg-white p-5">
                <h3 className="text-sm font-bold">{topic.title}</h3>
                <p className="mt-2 text-sm text-muted">{topic.body}</p>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h2 className="text-xl font-semibold">Other pages</h2>
          <p className="mt-3">
            Editorial standards live on the{" "}
            <a href="/about" className="text-accent underline">
              about page
            </a>
            , data handling is described in the{" "}
            <a href="/privacy" className="text-accent underline">
              privacy policy
            </a>
            , and site rules are in the{" "}
            <a href="/terms" className="text-accent underline">
              terms of use
            </a>
            .
          </p>
        </section>
      </div>
    </article>
  );
}
