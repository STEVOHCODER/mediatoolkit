import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  ExternalLink,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/adsense";
import { CopyButton } from "@/components/copy-button";
import { FaqList } from "@/components/faq-list";
import { TutorialBody } from "@/components/tutorial-body";
import { tutorialArticles } from "@/lib/tutorial-data";
import {
  getPublishedTutorialBySlug,
  getPublishedTutorials,
} from "@/lib/tutorial-repository";
import { getPublishedErrors } from "@/lib/error-repository";

export const revalidate = 300;

export function generateStaticParams() {
  return tutorialArticles.map((tutorial) => ({ slug: tutorial.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tutorial = await getPublishedTutorialBySlug(slug);
  if (!tutorial) return {};

  return {
    title: tutorial.title,
    description: tutorial.excerpt,
    keywords: tutorial.tags,
    alternates: { canonical: `/tutorials/${tutorial.slug}` },
    openGraph: {
      type: "article",
      title: tutorial.title,
      description: tutorial.excerpt,
      url: `/tutorials/${tutorial.slug}`,
    },
  };
}

export default async function TutorialPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tutorial = await getPublishedTutorialBySlug(slug);
  if (!tutorial) notFound();

  const [errors, allTutorials] = await Promise.all([
    getPublishedErrors(),
    getPublishedTutorials(),
  ]);
  const relatedErrors = tutorial.relatedErrorSlugs
    .map((errorSlug) => errors.find((error) => error.slug === errorSlug))
    .filter((error): error is NonNullable<typeof error> => Boolean(error));
  const relatedTutorials = allTutorials
    .filter(
      (item) =>
        item.slug !== tutorial.slug &&
        (item.technology === tutorial.technology ||
          item.tags.some((tag) => tutorial.tags.includes(tag))),
    )
    .slice(0, 2);
  const pageUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://mediatoolkit.tech"}/tutorials/${tutorial.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        headline: tutorial.title,
        description: tutorial.excerpt,
        datePublished: tutorial.publishedAt,
        proficiencyLevel: tutorial.difficulty,
        about: tutorial.tags,
        mainEntityOfPage: pageUrl,
      },
      {
        "@type": "FAQPage",
        mainEntity: tutorial.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
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
          <Link href="/tutorials" className="flex items-center gap-2 text-[10px] font-bold text-faint hover:text-foreground">
            <ArrowLeft size={13} /> Tutorials
          </Link>
          <div className="mt-8 border-l border-line pl-3">
            <span className="font-mono text-[8px] uppercase text-accent">You will learn</span>
            <ul className="mt-3 grid gap-3">
              {tutorial.outcomes.map((outcome) => (
                <li key={outcome} className="text-[9px] leading-5 text-faint">
                  {outcome}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <article className="min-w-0">
          <header className="border-b border-line pb-10">
            <div className="flex items-center gap-2 font-mono text-[9px] text-faint">
              <Link href="/">Home</Link>
              <span>/</span>
              <Link href="/tutorials">Tutorials</Link>
              <span>/</span>
              <span>{tutorial.technology}</span>
            </div>
            <div className="mt-7 flex flex-wrap gap-1.5">
              <span className="rounded border border-accent/30 bg-accent/10 px-2 py-1 font-mono text-[8px] text-accent">
                {tutorial.technology}
              </span>
              <span className="rounded border border-line px-2 py-1 font-mono text-[8px] text-muted">
                {tutorial.difficulty}
              </span>
              <span className="rounded border border-line px-2 py-1 font-mono text-[8px] text-muted">
                {tutorial.category}
              </span>
            </div>
            <h1 className="mt-5 text-3xl leading-tight font-semibold sm:text-5xl">
              {tutorial.title}
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-muted">
              {tutorial.excerpt}
            </p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[9px] text-faint">
              <span className="flex items-center gap-1.5">
                <Clock3 size={13} className="text-accent" /> {tutorial.estimatedTime}
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen size={13} className="text-accent" /> Published {tutorial.publishedAt}
              </span>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <CopyButton value={pageUrl} label="Copy link" />
              <Link href="/debug" className="inline-flex h-8 items-center gap-1.5 rounded bg-accent px-3 text-[9px] font-extrabold text-[#04110b]">
                Open debugger <ArrowRight size={12} />
              </Link>
            </div>
          </header>

          {tutorial.prerequisites.length ? (
            <section className="border-b border-line-soft py-10">
              <h2 className="text-xl font-semibold">Before you start</h2>
              <ul className="mt-4 grid gap-2">
                {tutorial.prerequisites.map((item) => (
                  <li key={item} className="flex gap-2 text-xs leading-6 text-muted">
                    <CheckCircle2 size={14} className="mt-1 shrink-0 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <TutorialBody body={tutorial.body} />

          <AdSlot
            slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE}
            placement="Tutorial"
            className="border-t border-line-soft py-8"
          />

          {relatedErrors.length ? (
            <section className="border-t border-line-soft py-12">
              <h2 className="text-2xl font-semibold">Errors this tutorial helps prevent</h2>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {relatedErrors.map((error) => (
                  <Link key={error.slug} href={`/errors/${error.slug}`} className="flex min-h-24 flex-col justify-between rounded-md border border-line bg-surface p-4 hover:border-accent">
                    <strong className="font-mono text-[10px] font-medium">{error.title}</strong>
                    <span className="flex items-center justify-between text-[9px] text-faint">
                      {error.framework ?? error.language}
                      <ArrowRight size={12} />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {relatedTutorials.length ? (
            <section className="border-t border-line-soft py-12">
              <h2 className="text-2xl font-semibold">Continue learning</h2>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {relatedTutorials.map((item) => (
                  <Link key={item.slug} href={`/tutorials/${item.slug}`} className="rounded-md border border-line bg-surface p-4 hover:border-accent">
                    <strong className="block text-sm">{item.title}</strong>
                    <span className="mt-3 flex items-center justify-between font-mono text-[9px] text-faint">
                      {item.technology}
                      <ArrowRight size={12} />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {tutorial.faqs.length ? (
            <section className="border-t border-line-soft py-12">
              <h2 className="text-2xl font-semibold">Frequently asked questions</h2>
              <div className="mt-5"><FaqList items={tutorial.faqs} /></div>
            </section>
          ) : null}

          {tutorial.references.length ? (
            <section className="border-t border-line-soft py-12">
              <h2 className="text-2xl font-semibold">References</h2>
              <div className="mt-5 grid gap-2">
                {tutorial.references.map((reference) => (
                  <a
                    key={reference.url}
                    href={reference.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-md border border-line bg-surface p-4 hover:border-accent"
                  >
                    <span>
                      <small className="block font-mono text-[8px] uppercase text-accent">{reference.type}</small>
                      <strong className="mt-1 block text-xs">{reference.label}</strong>
                    </span>
                    <ExternalLink size={14} className="text-faint" />
                  </a>
                ))}
              </div>
            </section>
          ) : null}
        </article>
      </div>
    </>
  );
}
