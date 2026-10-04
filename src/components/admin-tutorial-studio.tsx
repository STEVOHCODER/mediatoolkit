"use client";

import {
  ArrowUpRight,
  BookOpen,
  CirclePlus,
  Copy,
  Database,
  Download,
  Eye,
  FileJson,
  FileText,
  HardDrive,
  LoaderCircle,
  LogOut,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { TutorialBody } from "@/components/tutorial-body";
import { tutorialArticleSchema } from "@/lib/article-schema";
import type { TutorialArticle } from "@/lib/types";

type AdminTutorialEntry = {
  slug: string;
  title: string;
  technology: string;
  status: string;
  updated_at: string;
  content?: TutorialArticle;
};

type FaqDraft = TutorialArticle["faqs"][number];
type ReferenceDraft = TutorialArticle["references"][number];

const inputClass =
  "mt-1.5 h-10 w-full rounded-md border border-line bg-background px-3 text-[11px] outline-none placeholder:text-faint focus:border-accent";
const textareaClass =
  "mt-1.5 min-h-28 w-full resize-y rounded-md border border-line bg-background px-3 py-2.5 text-[11px] leading-6 outline-none placeholder:text-faint focus:border-accent";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function lines(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-[9px] font-bold uppercase text-faint">{label}</span>
      {children}
      {hint ? <small className="mt-1 block text-[8px] text-faint">{hint}</small> : null}
    </label>
  );
}

function downloadJson(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function AdminTutorialStudio({
  initialEntries,
  today,
  storageMode,
}: {
  initialEntries: AdminTutorialEntry[];
  today: string;
  storageMode: "supabase" | "local" | "unavailable";
}) {
  const router = useRouter();
  const [entries, setEntries] = useState(initialEntries);
  const [status, setStatus] = useState<"draft" | "review" | "published">("draft");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [technology, setTechnology] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] =
    useState<TutorialArticle["difficulty"]>("Beginner");
  const [estimatedTime, setEstimatedTime] = useState("15 min");
  const [tags, setTags] = useState("");
  const [prerequisites, setPrerequisites] = useState("");
  const [outcomes, setOutcomes] = useState("");
  const [body, setBody] = useState("");
  const [relatedErrorSlugs, setRelatedErrorSlugs] = useState("");
  const [faqs, setFaqs] = useState<FaqDraft[]>([]);
  const [references, setReferences] = useState<ReferenceDraft[]>([]);
  const [publishedAt, setPublishedAt] = useState(today);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  const wordCount = useMemo(
    () => body.trim().split(/\s+/).filter(Boolean).length,
    [body],
  );
  const headingCount = useMemo(
    () => body.split(/\r?\n/).filter((line) => /^#{2,3}\s+/.test(line.trim())).length,
    [body],
  );
  const readinessChecks = [
    { label: "Descriptive title", ready: title.trim().length >= 35 },
    { label: "Search excerpt", ready: excerpt.trim().length >= 80 },
    { label: "Substantial body", ready: wordCount >= 500 },
    { label: "Clear sections", ready: headingCount >= 3 },
    { label: "Two or more outcomes", ready: lines(outcomes).length >= 2 },
    { label: "Useful tags", ready: tags.split(",").filter((item) => item.trim()).length >= 2 },
    { label: "Official reference", ready: references.length >= 1 },
    { label: "Reader FAQs", ready: faqs.length >= 2 },
  ];
  const readinessScore = Math.round(
    (readinessChecks.filter((check) => check.ready).length / readinessChecks.length) * 100,
  );

  function buildTutorial(): TutorialArticle {
    return {
      slug,
      title,
      excerpt,
      technology,
      category,
      difficulty,
      estimatedTime,
      tags: tags
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      prerequisites: lines(prerequisites),
      outcomes: lines(outcomes),
      body,
      relatedErrorSlugs: lines(relatedErrorSlugs),
      faqs,
      references,
      publishedAt,
    };
  }

  function loadTutorial(
    tutorial: TutorialArticle,
    nextStatus: "draft" | "review" | "published" = "draft",
  ) {
    setStatus(nextStatus);
    setTitle(tutorial.title);
    setSlug(tutorial.slug);
    setSlugTouched(true);
    setExcerpt(tutorial.excerpt);
    setTechnology(tutorial.technology);
    setCategory(tutorial.category);
    setDifficulty(tutorial.difficulty);
    setEstimatedTime(tutorial.estimatedTime);
    setTags(tutorial.tags.join(", "));
    setPrerequisites(tutorial.prerequisites.join("\n"));
    setOutcomes(tutorial.outcomes.join("\n"));
    setBody(tutorial.body);
    setRelatedErrorSlugs(tutorial.relatedErrorSlugs.join("\n"));
    setFaqs(tutorial.faqs);
    setReferences(tutorial.references);
    setPublishedAt(tutorial.publishedAt);
    setNotice(`Loaded ${tutorial.title}.`);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    setStatus("draft");
    setTitle("");
    setSlug("");
    setSlugTouched(false);
    setExcerpt("");
    setTechnology("");
    setCategory("");
    setDifficulty("Beginner");
    setEstimatedTime("15 min");
    setTags("");
    setPrerequisites("");
    setOutcomes("");
    setBody("");
    setRelatedErrorSlugs("");
    setFaqs([]);
    setReferences([]);
    setPublishedAt(today);
    setNotice("");
    setError("");
  }

  async function importMarkdown(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;

    const markdown = await file.text();
    const heading = markdown
      .split(/\r?\n/)
      .find((line) => line.trim().startsWith("# "))
      ?.replace(/^#\s+/, "")
      .trim();
    setBody(markdown);
    if (!title && heading) {
      setTitle(heading);
      if (!slugTouched) setSlug(slugify(heading));
    }
    setNotice(`Loaded Markdown from ${file.name}.`);
    setError("");
  }

  async function importJson(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;

    try {
      const raw = JSON.parse(await file.text()) as unknown;
      const wrapped =
        typeof raw === "object" && raw !== null && "tutorial" in raw
          ? (raw as { tutorial: unknown; status?: unknown })
          : { tutorial: raw, status: "draft" };
      const parsed = tutorialArticleSchema.safeParse(wrapped.tutorial);
      if (!parsed.success) {
        setError("This JSON does not match the MediaToolkit tutorial format.");
        setNotice("");
        return;
      }
      const importedStatus =
        wrapped.status === "review" || wrapped.status === "published"
          ? wrapped.status
          : "draft";
      loadTutorial(parsed.data, importedStatus);
      setNotice(`Imported ${parsed.data.title}.`);
    } catch {
      setError("The selected file is not valid JSON.");
      setNotice("");
    }
  }

  function downloadTemplate() {
    const tutorial: TutorialArticle = {
      slug: "technology-concept-tutorial",
      title: "A practical developer tutorial",
      excerpt:
        "A concise description of the problem this tutorial teaches the reader to solve.",
      technology: "Python",
      category: "Language fundamentals",
      difficulty: "Beginner",
      estimatedTime: "20 min",
      tags: ["python", "fundamentals"],
      prerequisites: ["Python 3 is installed."],
      outcomes: ["Explain the core concept.", "Complete the workflow safely."],
      body:
        "## First concept\n\nExplain the concept in plain language.\n\n```bash\ncommand --example\n```\n\n## Verify the result\n\nShow the expected output and common mistakes.",
      relatedErrorSlugs: [],
      faqs: [
        {
          question: "A common tutorial question?",
          answer: "A direct answer with enough context to act.",
        },
      ],
      references: [
        {
          label: "Official documentation",
          url: "https://example.com/docs",
          type: "Official docs",
        },
      ],
      publishedAt: today,
    };
    downloadJson("MediaToolkit-tutorial-template.json", {
      status: "draft",
      tutorial,
    });
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    setError("");

    const tutorial = buildTutorial();
    const validation = tutorialArticleSchema.safeParse(tutorial);
    if (!validation.success) {
      setSaving(false);
      setError("Complete the required tutorial fields before saving.");
      return;
    }

    const response = await fetch("/api/admin/tutorials", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status, tutorial }),
    });
    const payload = (await response.json()) as {
      error?: string;
      storage?: "supabase" | "local";
    };
    setSaving(false);
    if (!response.ok) {
      setError(payload.error ?? "The tutorial could not be saved.");
      return;
    }

    const destination = payload.storage === "local" ? " to content/tutorials" : "";
    setNotice(
      `${status === "published" ? "Published" : "Saved"} ${title}${destination}.`,
    );
    setEntries((items) => [
      {
        slug,
        title,
        technology,
        status,
        updated_at: `${today}T00:00:00.000Z`,
        content: tutorial,
      },
      ...items.filter((item) => item.slug !== slug),
    ]);
    router.refresh();
  }

  async function logout() {
    await fetch("/api/admin/session", { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="min-h-[calc(100vh-68px)]">
      <div className="border-b border-line bg-surface/40">
        <div className="section-shell flex min-h-24 flex-col justify-center gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="font-mono text-[9px] uppercase text-accent">
              Content operations
            </span>
            <h1 className="mt-1 text-2xl font-semibold">Tutorial studio</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin"
              className="flex h-9 items-center gap-2 rounded-md border border-line px-3 text-[10px] font-bold text-muted hover:text-foreground"
            >
              <FileText size={13} /> Error studio
            </Link>
            <label className="flex h-9 cursor-pointer items-center gap-2 rounded-md border border-line px-3 text-[10px] font-bold text-muted hover:text-foreground">
              <Upload size={13} /> Import Markdown
              <input
                type="file"
                accept="text/markdown,.md,.markdown,text/plain"
                onChange={importMarkdown}
                className="hidden"
              />
            </label>
            <label className="flex h-9 cursor-pointer items-center gap-2 rounded-md border border-line px-3 text-[10px] font-bold text-muted hover:text-foreground">
              <FileJson size={13} /> Import JSON
              <input
                type="file"
                accept="application/json,.json"
                onChange={importJson}
                className="hidden"
              />
            </label>
            <button
              type="button"
              onClick={downloadTemplate}
              className="grid size-9 place-items-center rounded-md border border-line text-faint hover:text-foreground"
              aria-label="Download tutorial JSON template"
              title="Download tutorial JSON template"
            >
              <Download size={14} />
            </button>
            <button
              type="button"
              onClick={reset}
              className="flex h-9 items-center gap-2 rounded-md border border-line px-3 text-[10px] font-bold text-muted hover:text-foreground"
            >
              <Plus size={13} /> New
            </button>
            <button
              type="button"
              onClick={logout}
              className="grid size-9 place-items-center rounded-md border border-line text-faint hover:text-foreground"
              aria-label="Sign out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>

      <section className="section-shell border-b border-line-soft py-8">
        <div className="grid gap-7 lg:grid-cols-[.7fr_1.3fr] lg:items-start">
          <div>
            <span className="font-mono text-[9px] uppercase text-accent">
              Publishing workflow
            </span>
            <h2 className="mt-2 text-xl font-semibold">
              Write once, publish a searchable tutorial.
            </h2>
            <p className="mt-3 max-w-md text-[10px] leading-5 text-muted">
              Use the path that fits your workflow. Every saved tutorial gets its
              own URL, metadata, FAQ schema, copyable code blocks, related errors,
              and references.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              [
                FileText,
                "Structured editor",
                "Write the title, learning outcomes, Markdown body, FAQs, references, and related error slugs directly here.",
              ],
              [
                Upload,
                "Markdown import",
                "Upload an .md file to fill the tutorial body. Add the metadata fields in this studio, then preview and save.",
              ],
              [
                FileJson,
                "Complete JSON",
                "Download the template, edit it locally or generate it from a content system, then import the validated file.",
              ],
            ].map(([Icon, title, copy]) => {
              const WorkflowIcon = Icon as typeof FileText;
              return (
                <div key={String(title)} className="border-t border-line pt-3">
                  <WorkflowIcon size={15} className="text-accent" />
                  <strong className="mt-3 block text-[10px]">{String(title)}</strong>
                  <small className="mt-1 block text-[9px] leading-5 text-faint">
                    {String(copy)}
                  </small>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="section-shell grid gap-8 py-8 lg:grid-cols-[230px_minmax(0,1fr)]">
        <aside className="self-start lg:sticky lg:top-24">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <span className="text-[10px] font-bold">Tutorial catalog</span>
            <span className="font-mono text-[9px] text-faint">{entries.length}</span>
          </div>
          {storageMode === "local" ? (
            <div className="mt-3 rounded-md border border-[#e7c861]/25 bg-[#e7c861]/8 p-3 text-[9px] leading-5 text-[#e7d89f]">
              <HardDrive size={14} className="mb-2" />
              Local publishing is active. Saves are written to content/tutorials and can be committed with the site.
            </div>
          ) : storageMode === "unavailable" ? (
            <div className="mt-3 rounded-md border border-[#ff8795]/25 bg-[#ff8795]/8 p-3 text-[9px] leading-5 text-[#ffb4bd]">
              <Database size={14} className="mb-2" />
              Configure Supabase or enable MediaToolkit_LOCAL_PUBLISHING before saving.
            </div>
          ) : (
            <div className="mt-3 rounded-md border border-accent/20 bg-accent/5 p-3 text-[9px] leading-5 text-muted">
              <Database size={14} className="mb-2 text-accent" />
              Supabase publishing is connected for persistent production posts.
            </div>
          )}
          <div className="mt-2 max-h-[62vh] overflow-y-auto">
            {entries.length ? (
              entries.map((entry) => (
                <div key={entry.slug} className="border-b border-line-soft py-3">
                  <button
                    type="button"
                    disabled={!entry.content}
                    onClick={() => {
                      if (!entry.content) return;
                      const entryStatus =
                        entry.status === "review" || entry.status === "published"
                          ? entry.status
                          : "draft";
                      loadTutorial(entry.content, entryStatus);
                    }}
                    className="block w-full text-left disabled:cursor-not-allowed"
                  >
                    <strong className="block text-[10px] leading-5 hover:text-accent">
                      {entry.title}
                    </strong>
                  </button>
                  <span className="mt-1 flex items-center justify-between font-mono text-[8px] text-faint">
                    {entry.technology}
                    <b className={entry.status === "published" ? "font-medium text-accent" : "font-medium text-[#e7c861]"}>
                      {entry.status}
                    </b>
                  </span>
                  {entry.status === "published" ? (
                    <Link href={`/tutorials/${entry.slug}`} className="mt-2 flex items-center gap-1 text-[8px] font-bold text-muted hover:text-accent">
                      View page <ArrowUpRight size={10} />
                    </Link>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="py-5 text-[9px] leading-5 text-faint">
                No saved tutorials yet. Create a draft to start the catalog.
              </p>
            )}
          </div>
          <div className="mt-5 border-t border-line pt-4">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase text-faint">Search readiness</span>
              <strong className="font-mono text-xs text-accent">{readinessScore}%</strong>
            </div>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-accent" style={{ width: `${readinessScore}%` }} />
            </div>
            <div className="mt-3 grid gap-2">
              {readinessChecks.map((check) => (
                <span key={check.label} className={`flex items-center gap-2 text-[8px] ${check.ready ? "text-accent" : "text-faint"}`}>
                  <span className={`size-1.5 rounded-full ${check.ready ? "bg-accent" : "bg-line"}`} />
                  {check.label}
                </span>
              ))}
            </div>
            <p className="mt-3 font-mono text-[8px] text-faint">
              {wordCount} words / {headingCount} sections
            </p>
          </div>
        </aside>

        <form onSubmit={save} className="min-w-0">
          <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="font-mono text-[9px] uppercase text-faint">
                Structured editor
              </span>
              <h2 className="mt-1 text-xl font-semibold">{title || "New tutorial"}</h2>
            </div>
            <Field label="Publication status">
              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as "draft" | "review" | "published")
                }
                className={`${inputClass} mt-0 min-w-40`}
              >
                <option value="draft">Draft</option>
                <option value="review">Needs review</option>
                <option value="published">Published</option>
              </select>
            </Field>
          </div>

          {notice ? (
            <div className="mt-5 rounded-md border border-accent/25 bg-accent/5 p-3 text-[10px] text-accent">
              {notice}
            </div>
          ) : null}
          {error ? (
            <div className="mt-5 rounded-md border border-[#ff8795]/25 bg-[#ff8795]/5 p-3 text-[10px] text-[#ff8795]">
              {error}
            </div>
          ) : null}

          <section className="border-b border-line-soft py-8">
            <div className="mb-5 flex items-center gap-2">
              <BookOpen size={15} className="text-accent" />
              <h3 className="text-sm font-semibold">Identity and discovery</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Title">
                <input
                  value={title}
                  onChange={(event) => {
                    const value = event.target.value;
                    setTitle(value);
                    if (!slugTouched) setSlug(slugify(value));
                  }}
                  className={inputClass}
                  placeholder="Python modules and virtual environments"
                />
              </Field>
              <Field label="URL slug">
                <input
                  value={slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    setSlug(slugify(event.target.value));
                  }}
                  className={inputClass}
                  placeholder="python-modules-and-virtual-environments"
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Search excerpt">
                  <textarea
                    value={excerpt}
                    onChange={(event) => setExcerpt(event.target.value)}
                    className={textareaClass}
                  />
                </Field>
              </div>
              <Field label="Technology">
                <input
                  value={technology}
                  onChange={(event) => setTechnology(event.target.value)}
                  className={inputClass}
                  placeholder="Python"
                />
              </Field>
              <Field label="Category">
                <input
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className={inputClass}
                  placeholder="Language fundamentals"
                />
              </Field>
              <Field label="Difficulty">
                <select
                  value={difficulty}
                  onChange={(event) =>
                    setDifficulty(event.target.value as TutorialArticle["difficulty"])
                  }
                  className={inputClass}
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </Field>
              <Field label="Estimated time">
                <input
                  value={estimatedTime}
                  onChange={(event) => setEstimatedTime(event.target.value)}
                  className={inputClass}
                  placeholder="20 min"
                />
              </Field>
              <Field label="Tags" hint="Comma separated">
                <input
                  value={tags}
                  onChange={(event) => setTags(event.target.value)}
                  className={inputClass}
                  placeholder="python, imports, pip"
                />
              </Field>
              <Field label="Published date">
                <input
                  type="date"
                  value={publishedAt}
                  onChange={(event) => setPublishedAt(event.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>
          </section>

          <section className="border-b border-line-soft py-8">
            <h3 className="text-sm font-semibold">Learning design</h3>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Prerequisites" hint="One item per line">
                <textarea
                  value={prerequisites}
                  onChange={(event) => setPrerequisites(event.target.value)}
                  className={textareaClass}
                />
              </Field>
              <Field label="Learning outcomes" hint="One item per line">
                <textarea
                  value={outcomes}
                  onChange={(event) => setOutcomes(event.target.value)}
                  className={textareaClass}
                />
              </Field>
            </div>
          </section>

          <section className="border-b border-line-soft py-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="font-mono text-[9px] uppercase text-accent">
                  Markdown
                </span>
                <h3 className="mt-1 text-sm font-semibold">Tutorial body</h3>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewOpen(true)}
                  className="flex h-9 items-center gap-2 rounded-md border border-line px-3 text-[9px] font-bold text-muted hover:text-foreground"
                >
                  <Eye size={13} /> Preview draft
                </button>
                <button
                  type="button"
                  onClick={() =>
                    navigator.clipboard.writeText(
                      JSON.stringify(
                        { status, tutorial: buildTutorial() },
                        null,
                        2,
                      ),
                    )
                  }
                  className="grid size-9 place-items-center rounded-md border border-line text-faint hover:text-foreground"
                  aria-label="Copy tutorial JSON"
                  title="Copy tutorial JSON"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              className={`${textareaClass} min-h-[520px] font-mono text-[10px] leading-7`}
              placeholder={"## First concept\n\nExplain the idea.\n\n```bash\ncommand --example\n```"}
            />
            <Field label="Related error slugs" hint="One slug per line">
              <textarea
                value={relatedErrorSlugs}
                onChange={(event) => setRelatedErrorSlugs(event.target.value)}
                className={textareaClass}
              />
            </Field>
          </section>

          <section className="border-b border-line-soft py-8">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Frequently asked questions</h3>
              <button
                type="button"
                onClick={() =>
                  setFaqs((items) => [...items, { question: "", answer: "" }])
                }
                className="flex h-8 items-center gap-1.5 rounded-md border border-line px-2.5 text-[9px] font-bold text-muted hover:text-foreground"
              >
                <CirclePlus size={12} /> Add FAQ
              </button>
            </div>
            <div className="mt-4 grid gap-3">
              {faqs.map((faq, index) => (
                <div key={`${index}-${faq.question}`} className="grid gap-3 rounded-md border border-line bg-surface p-4">
                  <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                    <input
                      value={faq.question}
                      onChange={(event) =>
                        setFaqs((items) =>
                          items.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, question: event.target.value }
                              : item,
                          ),
                        )
                      }
                      className={inputClass.replace("mt-1.5 ", "")}
                      placeholder="Question"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFaqs((items) =>
                          items.filter((_, itemIndex) => itemIndex !== index),
                        )
                      }
                      className="grid size-10 place-items-center rounded-md border border-line text-faint hover:text-[#ff8795]"
                      aria-label="Remove FAQ"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <textarea
                    value={faq.answer}
                    onChange={(event) =>
                      setFaqs((items) =>
                        items.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, answer: event.target.value }
                            : item,
                        ),
                      )
                    }
                    className={textareaClass.replace("mt-1.5 ", "")}
                    placeholder="Answer"
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="py-8">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">References</h3>
              <button
                type="button"
                onClick={() =>
                  setReferences((items) => [
                    ...items,
                    { label: "", url: "", type: "Official docs" },
                  ])
                }
                className="flex h-8 items-center gap-1.5 rounded-md border border-line px-2.5 text-[9px] font-bold text-muted hover:text-foreground"
              >
                <CirclePlus size={12} /> Add reference
              </button>
            </div>
            <div className="mt-4 grid gap-3">
              {references.map((reference, index) => (
                <div key={`${index}-${reference.url}`} className="grid gap-3 rounded-md border border-line bg-surface p-4 sm:grid-cols-[140px_1fr_1fr_auto]">
                  <select
                    value={reference.type}
                    onChange={(event) =>
                      setReferences((items) =>
                        items.map((item, itemIndex) =>
                          itemIndex === index
                            ? {
                                ...item,
                                type: event.target.value as ReferenceDraft["type"],
                              }
                            : item,
                        ),
                      )
                    }
                    className={inputClass.replace("mt-1.5 ", "")}
                  >
                    <option>Official docs</option>
                    <option>GitHub</option>
                    <option>Discussion</option>
                  </select>
                  <input
                    value={reference.label}
                    onChange={(event) =>
                      setReferences((items) =>
                        items.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, label: event.target.value }
                            : item,
                        ),
                      )
                    }
                    className={inputClass.replace("mt-1.5 ", "")}
                    placeholder="Reference label"
                  />
                  <input
                    value={reference.url}
                    onChange={(event) =>
                      setReferences((items) =>
                        items.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, url: event.target.value }
                            : item,
                        ),
                      )
                    }
                    className={inputClass.replace("mt-1.5 ", "")}
                    placeholder="https://"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setReferences((items) =>
                        items.filter((_, itemIndex) => itemIndex !== index),
                      )
                    }
                    className="grid size-10 place-items-center rounded-md border border-line text-faint hover:text-[#ff8795]"
                    aria-label="Remove reference"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <div className="sticky bottom-0 flex flex-col gap-3 border-t border-line bg-background/95 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <span className="font-mono text-[9px] text-faint">
              /tutorials/{slug || "tutorial-slug"}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="flex h-10 items-center gap-2 rounded-md border border-line px-3 text-[10px] font-bold text-muted hover:text-foreground"
              >
                Preview draft <Eye size={12} />
              </button>
              <button
                type="submit"
                disabled={saving || storageMode === "unavailable"}
                className="flex h-10 items-center gap-2 rounded-md bg-accent px-4 text-[10px] font-extrabold text-[#04110b] disabled:opacity-50"
              >
                {saving ? <LoaderCircle size={14} className="animate-spin" /> : <Save size={14} />}
                Save tutorial
              </button>
            </div>
          </div>
        </form>
      </div>
      {previewOpen ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-background/95 p-4 backdrop-blur sm:p-8">
          <div className="mx-auto max-w-4xl rounded-md border border-line bg-background shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-background/95 px-5 py-4 backdrop-blur">
              <div>
                <span className="font-mono text-[8px] uppercase text-accent">Draft preview</span>
                <strong className="mt-1 block text-sm">{title || "Untitled tutorial"}</strong>
              </div>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="grid size-9 place-items-center rounded-md border border-line text-faint hover:text-foreground"
                aria-label="Close tutorial preview"
              >
                <X size={15} />
              </button>
            </div>
            <article className="px-5 py-8 sm:px-10">
              <div className="border-b border-line-soft pb-7">
                <span className="font-mono text-[9px] uppercase text-accent">
                  {technology || "Technology"} / {category || "Category"}
                </span>
                <h1 className="mt-3 text-3xl font-semibold leading-tight">
                  {title || "Untitled tutorial"}
                </h1>
                <p className="mt-4 text-sm leading-7 text-muted">
                  {excerpt || "Add a search excerpt to explain what the reader will learn."}
                </p>
              </div>
              {body.trim() ? (
                <TutorialBody body={body} />
              ) : (
                <p className="py-12 text-sm text-faint">Write Markdown to preview the tutorial body.</p>
              )}
            </article>
          </div>
        </div>
      ) : null}
    </div>
  );
}
