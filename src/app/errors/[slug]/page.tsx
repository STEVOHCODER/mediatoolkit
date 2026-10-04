import type { Metadata } from "next";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronRight,
  Clock3,
  ExternalLink,
  Gauge,
  MessageSquareText,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/adsense";
import { ArticleInteractions } from "@/components/article-interactions";
import { CopyButton } from "@/components/copy-button";
import { FaqList } from "@/components/faq-list";
import { errorArticles } from "@/lib/data";
import {
  getPublishedErrorBySlug,
  getPublishedErrors,
} from "@/lib/error-repository";

export const revalidate = 300;

export function generateStaticParams() {
  return errorArticles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedErrorBySlug(slug);
  if (!article) return {};
  return {
    title: `${article.title} - Causes and fixes`,
    description: `${article.excerpt} Learn the most likely causes and verified fixes.`,
    keywords: article.tags,
    alternates: { canonical: `/errors/${article.slug}` },
    openGraph: {
      title: `${article.title} - DevFixes`,
      description: article.excerpt,
      type: "article",
      url: `/errors/${article.slug}`,
    },
  };
}

function CodeBlock({ code, label = "Terminal" }: { code: string; label?: string }) {
  return (
    <div className="mt-5 overflow-hidden rounded-md border border-line bg-[#090c0f]">
      <div className="flex h-11 items-center justify-between border-b border-[#20272d] px-3.5 font-mono text-[9px] text-[#7e8993]">
        {label}
        <CopyButton value={code} />
      </div>
      <pre className="code-scroll overflow-x-auto p-5 font-mono text-[11px] leading-7 text-[#d5dce2]">{code}</pre>
    </div>
  );
}

export default async function ErrorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getPublishedErrorBySlug(slug);
  if (!article) notFound();

  const allArticles = await getPublishedErrors();
  const related = article.relatedSlugs
    .map((relatedSlug) =>
      allArticles.find((item) => item.slug === relatedSlug),
    )
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const pageUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://mediatoolkit.tech"}/errors/${article.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        headline: article.title,
        description: article.excerpt,
        dateModified: article.verifiedAt,
        proficiencyLevel: article.difficulty,
        about: article.tags,
        mainEntityOfPage: pageUrl,
      },
      {
        "@type": "FAQPage",
        mainEntity: article.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
      {
        "@type": "HowTo",
        name: `How to fix ${article.title}`,
        totalTime: "PT15M",
        step: article.solutions.map((solution, index) => ({
          "@type": "HowToStep",
          position: index + 1,
          name: solution.title,
          text: solution.description,
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <div className="section-shell grid gap-10 py-10 lg:grid-cols-[150px_minmax(0,760px)_170px] lg:justify-between">
        <aside className="hidden self-start lg:sticky lg:top-24 lg:block">
          <Link href="/questions" className="flex items-center gap-2 text-[10px] font-bold text-faint hover:text-foreground">
            <ArrowLeft size={13} /> All questions
          </Link>
          <nav className="mt-8 grid gap-1 border-l border-line pl-3 text-[9px] text-faint">
            {[
              ["meaning", "What it means"],
              ["causes", "Why it happens"],
              ["ai", "AI explanation"],
              ["quick-fix", "Quick fix"],
              ["steps", "Step-by-step"],
              ["alternatives", "Alternatives"],
              ["examples", "Examples"],
              ["related", "Related errors"],
              ["faq", "FAQ"],
              ["references", "References"],
            ].map(([id, label]) => (
              <a key={id} href={`#${id}`} className="py-1.5 hover:text-accent">{label}</a>
            ))}
          </nav>
        </aside>

        <article className="min-w-0">
          <div className="border-b border-line pb-10">
            <div className="flex items-center gap-1.5 font-mono text-[9px] text-faint">
              <Link href="/">Home</Link><ChevronRight size={10} />
              <Link href="/questions">Questions</Link><ChevronRight size={10} />
              <Link href={`/search?q=${article.language}`}>{article.language}</Link><ChevronRight size={10} />
              <span>{article.category}</span>
            </div>
            <div className="mt-7 flex flex-wrap gap-1.5">
              <span className="rounded border border-accent/30 bg-accent/10 px-2 py-1 font-mono text-[8px] text-accent">{article.framework ?? article.language}</span>
              <span className="rounded border border-line px-2 py-1 font-mono text-[8px] text-muted">{article.difficulty}</span>
              <span className="rounded border border-line px-2 py-1 font-mono text-[8px] text-muted">{article.severity} severity</span>
            </div>
            <h1 className="mt-4 overflow-wrap-anywhere font-mono text-3xl leading-tight font-medium sm:text-4xl">{article.title}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">{article.excerpt}</p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[9px] text-faint">
              <span className="flex items-center gap-1.5"><Clock3 size={13} className="text-accent" /> {article.fixTime}</span>
              <span className="flex items-center gap-1.5"><Gauge size={13} className="text-accent" /> Popularity {article.popularity}/100</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-accent" /> Verified {article.verifiedAt}</span>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <CopyButton value={article.title} label="Copy error" />
              <CopyButton value={pageUrl} label="Copy link" />
              <Link href={`/debug?article=${article.slug}`} className="inline-flex h-8 items-center gap-1.5 rounded bg-accent px-3 text-[9px] font-extrabold text-[#04110b]">
                <Sparkles size={12} /> Debug with AI
              </Link>
              <Link href="/playground" className="inline-flex h-8 items-center gap-1.5 rounded border border-line px-3 text-[9px] font-bold text-muted">
                <MessageSquareText size={12} /> Practice this answer
              </Link>
            </div>
          </div>

          <div className="article-copy">
            <section id="meaning" className="scroll-mt-24 border-b border-line-soft py-12">
              <h2 className="text-2xl font-semibold">What does this error mean?</h2>
              <p className="mt-4">{article.whatItMeans}</p>
            </section>

            <section id="causes" className="scroll-mt-24 border-b border-line-soft py-12">
              <h2 className="text-2xl font-semibold">Why does this happen?</h2>
              <ul className="mt-4 list-disc pl-5">
                {article.causes.map((cause) => <li key={cause}>{cause}</li>)}
              </ul>
            </section>

            <section id="ai" className="scroll-mt-24 border-b border-line-soft py-12">
              <h2 className="text-2xl font-semibold">AI explanation</h2>
              <div className="relative mt-5 rounded-md border border-line bg-surface p-5 before:absolute before:top-[-1px] before:left-5 before:h-px before:w-20 before:bg-accent">
                <span className="flex items-center gap-2 text-[9px] font-extrabold uppercase text-accent"><Bot size={14} /> Plain-English analysis</span>
                <p className="mt-3">{article.aiExplanation}</p>
              </div>
            </section>

            <section id="quick-fix" className="scroll-mt-24 border-b border-line-soft py-12">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-emerald-700"><CheckCircle2 size={15} /> Accepted fix</span>
              <h2 className="mt-2 text-2xl font-semibold">Most likely solution</h2>
              <CodeBlock code={article.quickFix.commands.join("\n")} />
              <div className="mt-3 rounded-md border border-accent/20 bg-accent/5 p-4 text-[10px] text-muted">
                <strong className="text-foreground">Expected output: </strong>{article.quickFix.expected}
              </div>
            </section>

            <AdSlot
              slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE}
              placement="Error article"
              className="border-b border-line-soft py-8"
            />

            <section id="steps" className="scroll-mt-24 border-b border-line-soft py-12">
              <h2 className="text-2xl font-semibold">Verified answers</h2>
              <div className="mt-5 grid gap-2">
                {article.solutions.map((solution, index) => (
                  <div key={solution.title} className="overflow-hidden rounded-md border border-line bg-surface">
                    <div className="grid min-h-16 grid-cols-[30px_1fr_auto_auto] items-center gap-3 px-4">
                      <span className="grid size-7 place-items-center rounded bg-accent/10 font-mono text-[9px] text-accent">{index + 1}</span>
                      <span>
                        <strong className="block text-xs">{solution.title}</strong>
                        <small className="text-[9px] text-faint">{solution.description}</small>
                      </span>
                      <b className="font-mono text-[9px] font-medium text-accent">{solution.probability}%</b>
                      <CopyButton
                        value={[
                          solution.title,
                          solution.description,
                          ...(solution.commands ?? []),
                        ].join("\n")}
                        label="Copy step"
                      />
                    </div>
                    {solution.commands?.length ? <CodeBlock code={solution.commands.join("\n")} label="Command" /> : null}
                  </div>
                ))}
              </div>
            </section>

            <section id="alternatives" className="scroll-mt-24 border-b border-line-soft py-12">
              <h2 className="text-2xl font-semibold">Alternative solutions</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {article.alternatives.map((alternative) => (
                  <div key={alternative.environment} className="min-w-0 rounded-md border border-line bg-surface p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-xs font-bold text-accent">{alternative.environment}</h3>
                      <CopyButton
                        value={[
                          alternative.environment,
                          ...alternative.commands,
                          alternative.note,
                        ].join("\n")}
                        label="Copy"
                      />
                    </div>
                    <pre className="code-scroll mt-3 max-w-full overflow-x-auto font-mono text-[10px] leading-6 text-foreground">{alternative.commands.join("\n")}</pre>
                    <p className="mt-2 text-[10px] leading-5">{alternative.note}</p>
                  </div>
                ))}
              </div>
            </section>

            <section id="examples" className="scroll-mt-24 border-b border-line-soft py-12">
              <h2 className="text-2xl font-semibold">Real example</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-[1fr_28px_1fr] md:items-center">
                <div className="min-w-0"><span className="font-mono text-[9px] uppercase text-[#ff7a8a]">Broken</span><CodeBlock code={article.brokenCode} label={article.codeLanguage} /></div>
                <ArrowRight className="mx-auto rotate-90 text-accent md:rotate-0" size={16} />
                <div className="min-w-0"><span className="font-mono text-[9px] uppercase text-accent">Corrected</span><CodeBlock code={article.fixedCode} label={article.codeLanguage} /></div>
              </div>
            </section>

            <section id="related" className="scroll-mt-24 border-b border-line-soft py-12">
              <h2 className="text-2xl font-semibold">Related errors</h2>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {related.map((item) => (
                  <Link key={item.slug} href={`/errors/${item.slug}`} className="flex min-h-24 flex-col justify-between rounded-md border border-line bg-surface p-4 hover:border-accent">
                    <strong className="font-mono text-[10px] font-medium">{item.title}</strong>
                    <span className="flex items-center justify-between text-[9px] text-faint">{item.framework ?? item.language}<ArrowRight size={12} /></span>
                  </Link>
                ))}
              </div>
            </section>

            <section id="faq" className="scroll-mt-24 border-b border-line-soft py-12">
              <h2 className="text-2xl font-semibold">Frequently asked questions</h2>
              <div className="mt-5"><FaqList items={article.faqs} /></div>
            </section>

            <section id="references" className="scroll-mt-24 py-12">
              <h2 className="text-2xl font-semibold">References</h2>
              <div className="mt-5 grid gap-2">
                {article.references.map((reference) => (
                  <a key={reference.url} href={reference.url} target="_blank" rel="noreferrer" className="flex min-h-12 items-center justify-between rounded-md border border-line px-4 text-[10px] text-muted hover:border-faint hover:text-foreground">
                    <span><b className="mr-2 text-foreground">{reference.type}</b>{reference.label}</span>
                    <ExternalLink size={12} />
                  </a>
                ))}
              </div>
            </section>
          </div>
        </article>

        <ArticleInteractions slug={article.slug} />
      </div>
    </>
  );
}
