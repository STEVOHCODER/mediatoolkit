"use client";

import {
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  CirclePlus,
  Copy,
  Database,
  Download,
  FileText,
  LoaderCircle,
  LogOut,
  Plus,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { errorArticleSchema } from "@/lib/article-schema";
import type { ErrorArticle } from "@/lib/types";

type AdminEntry = {
  slug: string;
  title: string;
  language: string;
  framework: string | null;
  status: string;
  updated_at: string;
  content?: ErrorArticle;
};

type SolutionDraft = {
  title: string;
  description: string;
  probability: number;
  commands: string;
};

type AlternativeDraft = {
  environment: string;
  commands: string;
  note: string;
};

type FaqDraft = {
  question: string;
  answer: string;
};

type ReferenceDraft = {
  label: string;
  url: string;
  type: "Official docs" | "GitHub" | "Discussion";
};

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

export function AdminDashboard({
  initialEntries,
  today,
  supabaseConfigured,
}: {
  initialEntries: AdminEntry[];
  today: string;
  supabaseConfigured: boolean;
}) {
  const router = useRouter();
  const [entries, setEntries] = useState(initialEntries);
  const [status, setStatus] = useState<"draft" | "review" | "published">("draft");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [language, setLanguage] = useState("");
  const [framework, setFramework] = useState("");
  const [category, setCategory] = useState("");
  const [severity, setSeverity] = useState<"Low" | "Medium" | "High">("Medium");
  const [difficulty, setDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">("Beginner");
  const [fixTime, setFixTime] = useState("5-15 min");
  const [popularity, setPopularity] = useState(50);
  const [views, setViews] = useState(0);
  const [trend, setTrend] = useState(0);
  const [tags, setTags] = useState("");
  const [whatItMeans, setWhatItMeans] = useState("");
  const [causes, setCauses] = useState("");
  const [aiExplanation, setAiExplanation] = useState("");
  const [quickCommands, setQuickCommands] = useState("");
  const [expected, setExpected] = useState("");
  const [brokenCode, setBrokenCode] = useState("");
  const [fixedCode, setFixedCode] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("text");
  const [relatedSlugs, setRelatedSlugs] = useState("");
  const [solutions, setSolutions] = useState<SolutionDraft[]>([
    { title: "", description: "", probability: 80, commands: "" },
  ]);
  const [alternatives, setAlternatives] = useState<AlternativeDraft[]>([]);
  const [faqs, setFaqs] = useState<FaqDraft[]>([]);
  const [references, setReferences] = useState<ReferenceDraft[]>([]);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  function buildArticle(): ErrorArticle {
    return {
      slug,
      title,
      excerpt,
      language,
      framework: framework || undefined,
      category,
      severity,
      difficulty,
      fixTime,
      popularity,
      views,
      trend,
      tags: tags
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      whatItMeans,
      causes: lines(causes),
      aiExplanation,
      quickFix: { commands: lines(quickCommands), expected },
      solutions: solutions.map((item) => ({
        ...item,
        commands: lines(item.commands),
      })),
      alternatives: alternatives.map((item) => ({
        ...item,
        commands: lines(item.commands),
      })),
      brokenCode,
      fixedCode,
      codeLanguage,
      relatedSlugs: lines(relatedSlugs),
      faqs,
      references,
      verifiedAt: today,
    };
  }

  function loadArticle(
    article: ErrorArticle,
    nextStatus: "draft" | "review" | "published" = "draft",
  ) {
    setStatus(nextStatus);
    setTitle(article.title);
    setSlug(article.slug);
    setSlugTouched(true);
    setExcerpt(article.excerpt);
    setLanguage(article.language);
    setFramework(article.framework ?? "");
    setCategory(article.category);
    setSeverity(article.severity);
    setDifficulty(article.difficulty);
    setFixTime(article.fixTime);
    setPopularity(article.popularity);
    setViews(article.views);
    setTrend(article.trend);
    setTags(article.tags.join(", "));
    setWhatItMeans(article.whatItMeans);
    setCauses(article.causes.join("\n"));
    setAiExplanation(article.aiExplanation);
    setQuickCommands(article.quickFix.commands.join("\n"));
    setExpected(article.quickFix.expected);
    setBrokenCode(article.brokenCode);
    setFixedCode(article.fixedCode);
    setCodeLanguage(article.codeLanguage);
    setRelatedSlugs(article.relatedSlugs.join("\n"));
    setSolutions(
      article.solutions.map((item) => ({
        title: item.title,
        description: item.description,
        probability: item.probability,
        commands: (item.commands ?? []).join("\n"),
      })),
    );
    setAlternatives(
      article.alternatives.map((item) => ({
        environment: item.environment,
        commands: item.commands.join("\n"),
        note: item.note,
      })),
    );
    setFaqs(article.faqs);
    setReferences(article.references);
    setNotice(`Loaded ${article.title}. Review the fields, then save or publish.`);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function importJson(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;

    try {
      const raw = JSON.parse(await file.text()) as unknown;
      const wrapped =
        typeof raw === "object" && raw !== null && "article" in raw
          ? (raw as { article: unknown; status?: unknown })
          : { article: raw, status: "draft" };
      const parsed = errorArticleSchema.safeParse(wrapped.article);
      if (!parsed.success) {
        setError("This JSON does not match the MediaToolkit article format.");
        setNotice("");
        return;
      }
      const importedStatus =
        wrapped.status === "review" || wrapped.status === "published"
          ? wrapped.status
          : "draft";
      loadArticle(parsed.data, importedStatus);
      setNotice(`Imported ${parsed.data.title}. Review it before saving.`);
    } catch {
      setError("The selected file is not valid JSON.");
      setNotice("");
    }
  }

  function downloadTemplate() {
    const template: ErrorArticle = {
      slug: "tool-error-short-name",
      title: "Exact error message",
      excerpt: "A concise search description explaining what failed and where.",
      language: "JavaScript",
      framework: "Node.js",
      category: "Packages and imports",
      severity: "Medium",
      difficulty: "Beginner",
      fixTime: "5-15 min",
      popularity: 50,
      views: 0,
      trend: 0,
      tags: ["nodejs", "package", "import"],
      whatItMeans:
        "Explain in beginner language what the runtime or tool tried to do and why it stopped.",
      causes: ["First common cause", "Second common cause"],
      aiExplanation:
        "Explain the failure path, the likely root cause, and which evidence the developer should inspect.",
      quickFix: {
        commands: ["command --to-fix", "command --to-verify"],
        expected: "Describe the output that confirms the fix worked.",
      },
      solutions: [
        {
          title: "Most likely solution",
          description: "Explain when this method applies and why it works.",
          probability: 80,
          commands: ["command --to-fix"],
        },
      ],
      alternatives: [
        {
          environment: "Windows",
          commands: ["windows-command"],
          note: "Explain the environment-specific difference.",
        },
      ],
      brokenCode: "broken example",
      fixedCode: "corrected example",
      codeLanguage: "javascript",
      relatedSlugs: [],
      faqs: [
        {
          question: "A common question about this error?",
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
      verifiedAt: today,
    };
    const blob = new Blob([JSON.stringify({ status: "draft", article: template }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "MediaToolkit-error-template.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function updateSolution(index: number, update: Partial<SolutionDraft>) {
    setSolutions((items) =>
      items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...update } : item)),
    );
  }

  function updateAlternative(index: number, update: Partial<AlternativeDraft>) {
    setAlternatives((items) =>
      items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...update } : item)),
    );
  }

  function updateFaq(index: number, update: Partial<FaqDraft>) {
    setFaqs((items) =>
      items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...update } : item)),
    );
  }

  function updateReference(index: number, update: Partial<ReferenceDraft>) {
    setReferences((items) =>
      items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...update } : item)),
    );
  }

  function reset() {
    setStatus("draft");
    setTitle("");
    setSlug("");
    setSlugTouched(false);
    setExcerpt("");
    setLanguage("");
    setFramework("");
    setCategory("");
    setSeverity("Medium");
    setDifficulty("Beginner");
    setFixTime("5-15 min");
    setPopularity(50);
    setViews(0);
    setTrend(0);
    setTags("");
    setWhatItMeans("");
    setCauses("");
    setAiExplanation("");
    setQuickCommands("");
    setExpected("");
    setBrokenCode("");
    setFixedCode("");
    setCodeLanguage("text");
    setRelatedSlugs("");
    setSolutions([{ title: "", description: "", probability: 80, commands: "" }]);
    setAlternatives([]);
    setFaqs([]);
    setReferences([]);
    setNotice("");
    setError("");
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    setError("");

    const article = buildArticle();

    const response = await fetch("/api/admin/errors", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status, article }),
    });
    const payload = await response.json();
    setSaving(false);
    if (!response.ok) {
      setError(payload.error ?? "The error could not be saved.");
      return;
    }
    setNotice(`${status === "published" ? "Published" : "Saved"} ${title}.`);
    setEntries((items) => [
      {
        slug,
        title,
        language,
        framework: framework || null,
        status,
        updated_at: `${today}T00:00:00.000Z`,
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
            <span className="font-mono text-[9px] uppercase text-accent">Content operations</span>
            <h1 className="mt-1 text-2xl font-semibold">Error knowledge base</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/tutorials"
              className="flex h-9 items-center gap-2 rounded-md border border-line px-3 text-[10px] font-bold text-muted hover:text-foreground"
            >
              <BookOpen size={13} /> Tutorial studio
            </Link>
            <label className="flex h-9 cursor-pointer items-center gap-2 rounded-md border border-line px-3 text-[10px] font-bold text-muted hover:text-foreground">
              <Upload size={13} /> Import JSON
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
              aria-label="Download article JSON template"
              title="Download article JSON template"
            >
              <Download size={14} />
            </button>
            <button
              type="button"
              onClick={reset}
              className="flex h-9 items-center gap-2 rounded-md border border-line px-3 text-[10px] font-bold text-muted hover:text-foreground"
            >
              <Plus size={13} /> New error
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

      <div className="section-shell grid gap-8 py-8 lg:grid-cols-[230px_minmax(0,1fr)]">
        <aside className="self-start lg:sticky lg:top-24">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <span className="text-[10px] font-bold">Catalog</span>
            <span className="font-mono text-[9px] text-faint">{entries.length}</span>
          </div>
          {!supabaseConfigured ? (
            <div className="mt-3 rounded-md border border-[#e7c861]/25 bg-[#e7c861]/8 p-3 text-[9px] leading-5 text-[#e7d89f]">
              <Database size={14} className="mb-2" />
              Add Supabase environment variables and run the migration before saving.
            </div>
          ) : null}
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
                      loadArticle(entry.content, entryStatus);
                    }}
                    className="block w-full text-left disabled:cursor-not-allowed"
                  >
                    <strong className="block text-[10px] leading-5 hover:text-accent">
                      {entry.title}
                    </strong>
                  </button>
                  <span className="mt-1 flex items-center justify-between font-mono text-[8px] text-faint">
                    {entry.framework ?? entry.language}
                    <b className={entry.status === "published" ? "font-medium text-accent" : "font-medium text-[#e7c861]"}>
                      {entry.status}
                    </b>
                  </span>
                  {entry.status === "published" ? (
                    <Link href={`/errors/${entry.slug}`} className="mt-2 flex items-center gap-1 text-[8px] font-bold text-muted hover:text-accent">
                      View page <ArrowUpRight size={10} />
                    </Link>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="py-5 text-[9px] leading-5 text-faint">No Supabase entries yet. Bundled starter articles remain public.</p>
            )}
          </div>
        </aside>

        <div className="min-w-0">
          <section className="mb-7 border-y border-line-soft py-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="font-mono text-[9px] uppercase text-accent">
                  Publishing workflow
                </span>
                <h2 className="mt-1 text-lg font-semibold">Write, review, publish.</h2>
              </div>
              <p className="max-w-md text-[9px] leading-5 text-faint">
                Start from the structured form or import a MediaToolkit JSON file. Save to
                Supabase as a draft, move it to review, then publish it to search and the
                sitemap.
              </p>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                ["01", "Write or import", "Complete the error, causes, commands, examples, FAQs, and references."],
                ["02", "Review the fix", "Verify commands on the listed environments and check every external source."],
                ["03", "Publish", "Choose Published and save. The public page revalidates automatically."],
              ].map(([number, step, copy]) => (
                <div key={number} className="grid grid-cols-[28px_1fr] gap-2 border-t border-line pt-3">
                  <b className="font-mono text-[9px] font-medium text-accent">{number}</b>
                  <span>
                    <strong className="block text-[10px]">{step}</strong>
                    <small className="mt-1 block text-[8px] leading-4 text-faint">{copy}</small>
                  </span>
                </div>
              ))}
            </div>
          </section>

          <form onSubmit={save}>
          <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="font-mono text-[9px] uppercase text-faint">Structured editor</span>
              <h2 className="mt-1 text-xl font-semibold">{title || "New error entry"}</h2>
            </div>
            <div className="flex gap-2">
              <label className="relative">
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value as typeof status)}
                  className="h-10 appearance-none rounded-md border border-line bg-surface pr-9 pl-3 text-[10px] font-bold outline-none"
                >
                  <option value="draft">Draft</option>
                  <option value="review">Needs review</option>
                  <option value="published">Published</option>
                </select>
                <ChevronDown size={13} className="pointer-events-none absolute top-3.5 right-3 text-faint" />
              </label>
              <button
                type="submit"
                disabled={saving || !supabaseConfigured}
                className="flex h-10 items-center gap-2 rounded-md bg-accent px-4 text-[10px] font-extrabold text-[#04110b] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {saving ? <LoaderCircle size={14} className="animate-spin" /> : <Save size={14} />}
                Save error
              </button>
            </div>
          </div>

          {notice ? (
            <div className="mt-5 flex items-center gap-2 rounded-md border border-accent/25 bg-accent/8 px-4 py-3 text-[10px] text-accent">
              <Check size={14} /> {notice}
            </div>
          ) : null}
          {error ? <div className="mt-5 rounded-md border border-[#ff7a8a]/25 bg-[#ff7a8a]/8 px-4 py-3 text-[10px] text-[#ff9ba7]">{error}</div> : null}

          <EditorSection title="Identity" description="Search result, URL, and taxonomy.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Error title">
                <input
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value);
                    if (!slugTouched) setSlug(slugify(event.target.value));
                  }}
                  className={inputClass}
                  placeholder="ModuleNotFoundError: No module named 'requests'"
                />
              </Field>
              <Field label="URL slug" hint="Lowercase letters, numbers, and hyphens.">
                <input
                  value={slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    setSlug(slugify(event.target.value));
                  }}
                  className={inputClass}
                  placeholder="python-modulenotfounderror-requests"
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Search excerpt">
                  <textarea value={excerpt} onChange={(event) => setExcerpt(event.target.value)} className={textareaClass} />
                </Field>
              </div>
              <Field label="Language">
                <input value={language} onChange={(event) => setLanguage(event.target.value)} className={inputClass} placeholder="Python" />
              </Field>
              <Field label="Framework or tool">
                <input value={framework} onChange={(event) => setFramework(event.target.value)} className={inputClass} placeholder="Django, npm, Docker..." />
              </Field>
              <Field label="Category">
                <input value={category} onChange={(event) => setCategory(event.target.value)} className={inputClass} placeholder="Packages and imports" />
              </Field>
              <Field label="Tags" hint="Comma separated.">
                <input value={tags} onChange={(event) => setTags(event.target.value)} className={inputClass} placeholder="python, pip, requests" />
              </Field>
              <Field label="Severity">
                <select value={severity} onChange={(event) => setSeverity(event.target.value as typeof severity)} className={inputClass}>
                  <option>Low</option><option>Medium</option><option>High</option>
                </select>
              </Field>
              <Field label="Difficulty">
                <select value={difficulty} onChange={(event) => setDifficulty(event.target.value as typeof difficulty)} className={inputClass}>
                  <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                </select>
              </Field>
              <Field label="Estimated fix time">
                <input value={fixTime} onChange={(event) => setFixTime(event.target.value)} className={inputClass} />
              </Field>
              <Field label="Popularity score">
                <input type="number" min="0" max="100" value={popularity} onChange={(event) => setPopularity(Number(event.target.value))} className={inputClass} />
              </Field>
              <Field label="Page views">
                <input type="number" min="0" value={views} onChange={(event) => setViews(Number(event.target.value))} className={inputClass} />
              </Field>
              <Field label="Search trend">
                <input type="number" min="-100" max="1000" value={trend} onChange={(event) => setTrend(Number(event.target.value))} className={inputClass} />
              </Field>
            </div>
          </EditorSection>

          <EditorSection title="Understanding" description="Beginner explanation and root-cause context.">
            <div className="grid gap-4">
              <Field label="What does this error mean?">
                <textarea value={whatItMeans} onChange={(event) => setWhatItMeans(event.target.value)} className={textareaClass} />
              </Field>
              <Field label="Common causes" hint="One cause per line.">
                <textarea value={causes} onChange={(event) => setCauses(event.target.value)} className={textareaClass} />
              </Field>
              <Field label="AI explanation">
                <textarea value={aiExplanation} onChange={(event) => setAiExplanation(event.target.value)} className={textareaClass} />
              </Field>
            </div>
          </EditorSection>

          <EditorSection title="Quick fix" description="The fastest verified path and expected result.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Commands" hint="One command per line.">
                <textarea value={quickCommands} onChange={(event) => setQuickCommands(event.target.value)} className={textareaClass} />
              </Field>
              <Field label="Expected output">
                <textarea value={expected} onChange={(event) => setExpected(event.target.value)} className={textareaClass} />
              </Field>
            </div>
          </EditorSection>

          <EditorSection
            title="Debug methods"
            description="Probability-ranked steps shown in the public article."
            action={
              <button type="button" onClick={() => setSolutions((items) => [...items, { title: "", description: "", probability: 60, commands: "" }])} className="flex h-8 items-center gap-1.5 rounded border border-line px-2.5 text-[9px] font-bold text-muted hover:text-foreground">
                <CirclePlus size={12} /> Add method
              </button>
            }
          >
            <div className="grid gap-3">
              {solutions.map((solution, index) => (
                <div key={index} className="grid gap-3 border-t border-line pt-4 sm:grid-cols-[32px_1fr_100px_32px]">
                  <span className="grid size-8 place-items-center rounded bg-accent/10 font-mono text-[10px] text-accent">{index + 1}</span>
                  <div className="grid gap-3">
                    <input value={solution.title} onChange={(event) => updateSolution(index, { title: event.target.value })} className={inputClass.replace("mt-1.5 ", "")} placeholder="Install with the active interpreter" />
                    <textarea value={solution.description} onChange={(event) => updateSolution(index, { description: event.target.value })} className={textareaClass.replace("mt-1.5 ", "")} placeholder="Explain when and why this step works." />
                    <textarea value={solution.commands} onChange={(event) => updateSolution(index, { commands: event.target.value })} className={textareaClass.replace("mt-1.5 ", "")} placeholder="One command per line" />
                  </div>
                  <Field label="Probability">
                    <input type="number" min="1" max="100" value={solution.probability} onChange={(event) => updateSolution(index, { probability: Number(event.target.value) })} className={inputClass} />
                  </Field>
                  <button type="button" onClick={() => setSolutions((items) => items.filter((_, itemIndex) => itemIndex !== index))} className="grid size-8 place-items-center text-faint hover:text-[#ff7a8a]" aria-label="Remove method">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </EditorSection>

          <EditorSection
            title="Environment alternatives"
            description="Windows, macOS, Linux, Docker, Conda, or other variants."
            action={
              <button type="button" onClick={() => setAlternatives((items) => [...items, { environment: "", commands: "", note: "" }])} className="flex h-8 items-center gap-1.5 rounded border border-line px-2.5 text-[9px] font-bold text-muted">
                <CirclePlus size={12} /> Add environment
              </button>
            }
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {alternatives.map((item, index) => (
                <div key={index} className="rounded-md border border-line bg-surface p-4">
                  <div className="flex justify-between gap-3">
                    <input value={item.environment} onChange={(event) => updateAlternative(index, { environment: event.target.value })} className={inputClass.replace("mt-1.5 ", "")} placeholder="Windows" />
                    <button type="button" onClick={() => setAlternatives((items) => items.filter((_, itemIndex) => itemIndex !== index))} className="text-faint hover:text-[#ff7a8a]"><Trash2 size={13} /></button>
                  </div>
                  <textarea value={item.commands} onChange={(event) => updateAlternative(index, { commands: event.target.value })} className={textareaClass} placeholder="One command per line" />
                  <textarea value={item.note} onChange={(event) => updateAlternative(index, { note: event.target.value })} className={textareaClass} placeholder="Environment-specific explanation" />
                </div>
              ))}
            </div>
          </EditorSection>

          <EditorSection title="Code example" description="A compact broken-to-correct comparison.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Broken code">
                <textarea value={brokenCode} onChange={(event) => setBrokenCode(event.target.value)} className={`${textareaClass} min-h-48 font-mono`} />
              </Field>
              <Field label="Corrected code">
                <textarea value={fixedCode} onChange={(event) => setFixedCode(event.target.value)} className={`${textareaClass} min-h-48 font-mono`} />
              </Field>
              <Field label="Syntax language">
                <input value={codeLanguage} onChange={(event) => setCodeLanguage(event.target.value)} className={inputClass} placeholder="python" />
              </Field>
              <Field label="Related slugs" hint="One MediaToolkit slug per line.">
                <textarea value={relatedSlugs} onChange={(event) => setRelatedSlugs(event.target.value)} className={textareaClass} />
              </Field>
            </div>
          </EditorSection>

          <EditorSection
            title="Frequently asked questions"
            description="These generate FAQ structured data."
            action={
              <button type="button" onClick={() => setFaqs((items) => [...items, { question: "", answer: "" }])} className="flex h-8 items-center gap-1.5 rounded border border-line px-2.5 text-[9px] font-bold text-muted">
                <CirclePlus size={12} /> Add FAQ
              </button>
            }
          >
            <div className="grid gap-3">
              {faqs.map((faq, index) => (
                <div key={index} className="grid gap-3 border-t border-line pt-4 sm:grid-cols-[1fr_1fr_32px]">
                  <input value={faq.question} onChange={(event) => updateFaq(index, { question: event.target.value })} className={inputClass.replace("mt-1.5 ", "")} placeholder="Question" />
                  <textarea value={faq.answer} onChange={(event) => updateFaq(index, { answer: event.target.value })} className={textareaClass.replace("mt-1.5 ", "")} placeholder="Answer" />
                  <button type="button" onClick={() => setFaqs((items) => items.filter((_, itemIndex) => itemIndex !== index))} className="grid size-8 place-items-center text-faint hover:text-[#ff7a8a]"><Trash2 size={13} /></button>
                </div>
              ))}
            </div>
          </EditorSection>

          <EditorSection
            title="References"
            description="Prefer official documentation and primary sources."
            action={
              <button type="button" onClick={() => setReferences((items) => [...items, { label: "", url: "", type: "Official docs" }])} className="flex h-8 items-center gap-1.5 rounded border border-line px-2.5 text-[9px] font-bold text-muted">
                <CirclePlus size={12} /> Add reference
              </button>
            }
          >
            <div className="grid gap-3">
              {references.map((reference, index) => (
                <div key={index} className="grid gap-3 border-t border-line pt-4 sm:grid-cols-[.7fr_1fr_150px_32px]">
                  <input value={reference.label} onChange={(event) => updateReference(index, { label: event.target.value })} className={inputClass.replace("mt-1.5 ", "")} placeholder="Reference label" />
                  <input value={reference.url} onChange={(event) => updateReference(index, { url: event.target.value })} className={inputClass.replace("mt-1.5 ", "")} placeholder="https://..." />
                  <select value={reference.type} onChange={(event) => updateReference(index, { type: event.target.value as ReferenceDraft["type"] })} className={inputClass.replace("mt-1.5 ", "")}>
                    <option>Official docs</option><option>GitHub</option><option>Discussion</option>
                  </select>
                  <button type="button" onClick={() => setReferences((items) => items.filter((_, itemIndex) => itemIndex !== index))} className="grid size-8 place-items-center text-faint hover:text-[#ff7a8a]"><Trash2 size={13} /></button>
                </div>
              ))}
            </div>
          </EditorSection>

          <div className="sticky bottom-3 mt-8 flex items-center justify-between gap-4 rounded-md border border-line bg-surface/95 p-3 shadow-[0_14px_50px_rgba(0,0,0,.35)] backdrop-blur-xl">
            <span className="hidden items-center gap-2 text-[9px] text-faint sm:flex">
              <FileText size={13} /> {solutions.length} debug methods / {faqs.length} FAQs / {references.length} references
            </span>
            <div className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={() =>
                  navigator.clipboard.writeText(
                    JSON.stringify({ status, article: buildArticle() }, null, 2),
                  )
                }
                className="grid size-9 place-items-center rounded-md border border-line text-faint hover:text-foreground"
                aria-label="Copy complete article JSON"
                title="Copy complete article JSON"
              >
                <Copy size={13} />
              </button>
              <button type="submit" disabled={saving || !supabaseConfigured} className="flex h-9 items-center gap-2 rounded-md bg-accent px-4 text-[10px] font-extrabold text-[#04110b] disabled:opacity-40">
                {saving ? <LoaderCircle size={14} className="animate-spin" /> : <Save size={14} />} Save {status}
              </button>
            </div>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function EditorSection({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="border-b border-line-soft py-8">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-bold">{title}</h3>
          <p className="mt-1 text-[9px] text-faint">{description}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
