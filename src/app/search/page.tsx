import type { Metadata } from "next";
import { ArrowRight, Search, TrendingUp } from "lucide-react";
import Link from "next/link";
import { AdSlot } from "@/components/adsense";
import { getPublishedErrors } from "@/lib/error-repository";
import { searchErrors } from "@/lib/fingerprint";

export const metadata: Metadata = {
  title: "Search programming errors",
  description: "Search the MediaToolkit index by error message, language, framework, or package.",
  alternates: { canonical: "/search" },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const resolved = await searchParams;
  const query = Array.isArray(resolved.q) ? resolved.q[0] : resolved.q ?? "";
  const articles = await getPublishedErrors();
  const results = searchErrors(query, articles);

  return (
    <div className="section-shell min-h-[75vh] py-14 sm:py-20">
      <span className="eyebrow">Error index</span>
      <div className="mt-4 grid items-end gap-7 md:grid-cols-[1fr_480px]">
        <div>
          <h1 className="text-3xl font-semibold sm:text-4xl">Search programming errors</h1>
          <p className="mt-2 text-xs text-faint">
            {query ? `${results.length} matches for "${query.slice(0, 90)}"` : `${results.length} verified fixes`}
          </p>
        </div>
        <form action="/search" className="flex h-12 items-center gap-2 rounded-md border border-line bg-surface px-3">
          <Search size={15} className="text-faint" />
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search an exception, package, or framework..."
            className="min-w-0 flex-1 bg-transparent font-mono text-[11px] outline-none placeholder:text-faint"
          />
          <button type="submit" className="h-9 rounded bg-accent px-4 text-[10px] font-extrabold text-[#04110b]">
            Search
          </button>
        </form>
      </div>

      <AdSlot
        slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_SEARCH}
        placement="Search results"
        className="mt-8 border-y border-line-soft py-6"
      />

      <div className="mt-12 grid gap-8 md:grid-cols-[180px_1fr]">
        <aside className="hidden border-t border-line pt-4 md:block">
          <span className="font-mono text-[9px] uppercase text-faint">Technologies</span>
          {["Python", "Node.js", "VS Code", "Git", "GitHub", "GitHub Actions", "Next.js", "Docker", "PostgreSQL", "Kubernetes"].map((item) => (
            <Link
              key={item}
              href={`/search?q=${encodeURIComponent(item)}`}
              className="flex min-h-9 items-center justify-between border-b border-line-soft text-[10px] font-semibold text-muted hover:text-accent"
            >
              {item} <ArrowRight size={11} />
            </Link>
          ))}
        </aside>

        <div className="border-t border-line">
          {results.length ? (
            results.map((error) => (
              <Link
                key={error.slug}
                href={`/errors/${error.slug}`}
                className="grid gap-3 border-b border-line-soft px-2 py-6 transition-colors hover:bg-surface sm:grid-cols-[1fr_auto]"
              >
                <div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="rounded border border-line px-2 py-1 font-mono text-[8px] text-muted">{error.framework ?? error.language}</span>
                    <span className="rounded border border-line px-2 py-1 font-mono text-[8px] text-muted">{error.difficulty}</span>
                  </div>
                  <h2 className="mt-3 font-mono text-sm font-medium transition-colors hover:text-accent">{error.title}</h2>
                  <p className="mt-2 max-w-3xl text-[11px] leading-6 text-muted">{error.excerpt}</p>
                </div>
                <div className="flex items-center gap-4 font-mono text-[9px] text-faint sm:flex-col sm:items-end sm:justify-center sm:gap-2">
                  <span className="flex items-center gap-1 text-accent"><TrendingUp size={11} /> +{error.trend}%</span>
                  <span>{Math.round(error.views / 1000)}k views</span>
                  <span>{error.fixTime}</span>
                </div>
              </Link>
            ))
          ) : (
            <div className="grid min-h-72 place-items-center border-b border-line-soft text-center">
              <div>
                <Search size={30} className="mx-auto text-faint" />
                <h2 className="mt-4 text-lg font-semibold">No verified match yet</h2>
                <p className="mt-2 text-xs text-muted">Paste the full trace into the AI debugger for a fingerprint analysis.</p>
                <Link href="/debug" className="mt-5 inline-flex h-10 items-center rounded bg-accent px-4 text-[10px] font-extrabold text-[#04110b]">
                  Debug this error
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
