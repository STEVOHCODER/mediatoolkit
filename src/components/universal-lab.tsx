"use client";

import {
  BookOpen,
  Braces,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Code2,
  Copy,
  Download,
  FileCode2,
  FileUp,
  GitBranch,
  Info,
  Lightbulb,
  Maximize2,
  Minimize2,
  MonitorCog,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Play,
  Plus,
  RotateCcw,
  Search,
  Send,
  Sparkles,
  SquareTerminal,
  Terminal,
  Trophy,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import {
  simulatorEnvironments,
  universalScenarios,
  type SimulatorEnvironment,
  type UniversalScenario,
} from "@/lib/universal-scenarios";

const environmentIcons = {
  python: Braces,
  node: Code2,
  javascript: Braces,
  git: GitBranch,
  powershell: SquareTerminal,
  cmd: Terminal,
  vscode: MonitorCog,
  bash: Terminal,
};

type TeachingContent = {
  concept: string;
  whyItHappens: string;
  observe: string[];
  steps: string[];
  brokenExample: string;
  fixedExample: string;
};

type UserScenario = UniversalScenario & { custom?: boolean; teaching?: TeachingContent };

type AiResult = {
  source?: "ai" | "local";
  provider?: "gemini" | "openai";
  summary: string;
  explanation: string;
  rootCause: string;
  confidence: number;
  fixes: Array<{ title: string; probability: number; explanation: string; commands: string[]; correctedCode?: string }>;
};

type DraftChallenge = {
  title: string;
  environment: SimulatorEnvironment;
  category: string;
  difficulty: UniversalScenario["difficulty"];
  errorOutput: string;
  explanation: string;
  starterCode: string;
  fixedCode: string;
  fixCommand: string;
};

const teachingById: Record<string, TeachingContent> = {
  "python-missing-requests": {
    concept: "Dependency ownership",
    whyItHappens: "The interpreter running your file is not finding requests in its active environment. Installing a package with a different pip can leave the error unchanged.",
    observe: ["The traceback points to the import, not your HTTP request.", "Compare the Python executable and the pip that owns it.", "The fix should be repeatable from requirements.txt."],
    steps: ["Reproduce the traceback so you can name the missing package.", "Inspect the active interpreter with python -c.", "Install through that interpreter, then verify the import."],
    brokenExample: "import requests\nprint(requests.get('https://example.com').status_code)",
    fixedExample: "python -m pip install requests\n# requirements.txt\nrequests>=2.32",
  },
  "python-indent": {
    concept: "Whitespace is syntax",
    whyItHappens: "Python uses indentation to define blocks. One extra space changes the structure of the function and the parser stops before execution begins.",
    observe: ["This fails during compilation, before any function runs.", "The caret points at the first line whose indentation is impossible.", "A formatter or py_compile gives fast feedback."],
    steps: ["Read the line number in the traceback.", "Compare the block indentation with its sibling lines.", "Compile again before testing application behavior."],
    brokenExample: "def build_report():\n    rows = []\n      return rows",
    fixedExample: "def build_report():\n    rows = []\n    return rows",
  },
  "node-module": {
    concept: "Module resolution",
    whyItHappens: "Node's ESM resolver does not guess local file extensions. The file exists, but the import specifier does not identify it exactly.",
    observe: ["The error names the resolved path and the missing specifier.", "package.json declares ESM mode.", "The smallest fix is the import boundary, not reinstalling packages."],
    steps: ["List the files to prove config.js exists.", "Inspect package.json for module mode.", "Use an explicit .js extension and rerun."],
    brokenExample: "import config from './config';\nconsole.log(config.port);",
    fixedExample: "import config from './config.js';\nconsole.log(config.port);",
  },
  "js-undefined": {
    concept: "Nullable data boundaries",
    whyItHappens: "The user object exists, but profile does not. Accessing name immediately assumes data that has not arrived or is not guaranteed by the API.",
    observe: ["The failing property is name, but the missing value is profile.", "Log the object at the boundary, not deep inside the render.", "Guard optional data and choose a deliberate fallback."],
    steps: ["Read the property named in the TypeError.", "Trace one level up to find the undefined value.", "Use optional chaining plus a user-facing fallback."],
    brokenExample: "const user = {};\nconsole.log(user.profile.name);",
    fixedExample: "const user = {};\nconsole.log(user.profile?.name ?? 'Guest');",
  },
};

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function environmentFromSlug(slug?: string): SimulatorEnvironment {
  if (slug === "react") return "javascript";
  if (slug === "linux") return "bash";
  if (["ai-coding", "cloud", "database", "docker"].includes(slug ?? "")) return "node";
  return simulatorEnvironments.some((item) => item.id === slug) ? slug as SimulatorEnvironment : "python";
}

function teachingFor(scenario: UserScenario): TeachingContent {
  return scenario.teaching ?? teachingById[scenario.id] ?? {
    concept: `${scenario.category} debugging`,
    whyItHappens: "The error is a signal about the environment, input, or execution path. Read it from the first useful line instead of jumping to a random fix.",
    observe: ["Capture the exact command and output.", "Inspect one fact that can prove or disprove the hypothesis.", "Make the smallest reversible change."],
    steps: ["Reproduce the failure.", "Run a diagnostic command.", "Apply the fix, then verify the original command."],
    brokenExample: scenario.starterCode,
    fixedExample: `# Suggested fix\n${scenario.fixCommand}`,
  };
}

function makeImportedScenario(raw: unknown, fileName: string): UserScenario {
  const value = (raw && typeof raw === "object" ? raw : {}) as Partial<UserScenario>;
  const environment = simulatorEnvironments.some((item) => item.id === value.environment) ? value.environment as SimulatorEnvironment : "python";
  const title = typeof value.title === "string" && value.title.trim() ? value.title.trim() : fileName.replace(/\.[^.]+$/, "");
  const errorOutput = typeof value.errorOutput === "string" && value.errorOutput.trim() ? value.errorOutput : "Paste the error output here.";
  const teaching = value.teaching ?? {
    concept: "Imported debugging case",
    whyItHappens: "Add the missing context and evidence so another developer can learn from this failure.",
    observe: ["What line first proves the failure?", "Which diagnostic would narrow the search?", "How will you verify the fix?"],
    steps: ["Reproduce the error.", "Inspect the environment.", "Apply and verify the fix."],
    brokenExample: value.starterCode ?? "",
    fixedExample: `# ${value.fixCommand ?? "Describe the corrected code"}`,
  };
  return {
    id: typeof value.id === "string" ? value.id : `custom-${Date.now()}`,
    title,
    environment,
    category: typeof value.category === "string" ? value.category : "Custom case",
    difficulty: value.difficulty === "Intermediate" || value.difficulty === "Advanced" ? value.difficulty : "Beginner",
    estimatedTime: typeof value.estimatedTime === "string" ? value.estimatedTime : "10 min",
    fileName: typeof value.fileName === "string" ? value.fileName : "example.txt",
    language: typeof value.language === "string" ? value.language : "text",
    starterCode: typeof value.starterCode === "string" ? value.starterCode : "",
    reproduceCommand: typeof value.reproduceCommand === "string" ? value.reproduceCommand : "run example",
    errorOutput,
    diagnosticCommands: value.diagnosticCommands && typeof value.diagnosticCommands === "object" ? value.diagnosticCommands as Record<string, string> : { "inspect error": errorOutput },
    fixCommand: typeof value.fixCommand === "string" ? value.fixCommand : "describe the fix",
    fixPatterns: Array.isArray(value.fixPatterns) ? value.fixPatterns.filter((item): item is string => typeof item === "string") : [],
    successOutput: typeof value.successOutput === "string" ? value.successOutput : "✓ Verification complete",
    hints: Array.isArray(value.hints) ? value.hints.filter((item): item is string => typeof item === "string") : ["Read the error literally.", "Inspect one useful signal."],
    teaching,
    custom: true,
  };
}

export function UniversalLab({ initialEnvironment }: { initialEnvironment?: string }) {
  const firstEnvironment = environmentFromSlug(initialEnvironment);
  const firstScenario: UserScenario = universalScenarios.find((item) => item.environment === firstEnvironment) ?? universalScenarios[0];
  const [customScenarios, setCustomScenarios] = useState<UserScenario[]>([]);
  const [environment, setEnvironment] = useState<SimulatorEnvironment>(firstEnvironment);
  const [scenario, setScenario] = useState<UserScenario>(firstScenario);
  const [search, setSearch] = useState("");
  const [editor, setEditor] = useState(firstScenario.starterCode);
  const [terminalLines, setTerminalLines] = useState<string[]>(["MediaToolkit runtime ready", `Loaded: ${firstScenario.title}`, "Reproduce the failure, inspect evidence, then fix it."]);
  const [command, setCommand] = useState("");
  const [hintIndex, setHintIndex] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [solved, setSolved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [showHow, setShowHow] = useState(true);
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [guideTab, setGuideTab] = useState<"learn" | "ai">("learn");
  const [aiInput, setAiInput] = useState(firstScenario.errorOutput);
  const [aiResult, setAiResult] = useState<AiResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [authoring, setAuthoring] = useState(false);
  const [draft, setDraft] = useState<DraftChallenge>({ title: "", environment: firstEnvironment, category: "Custom case", difficulty: "Beginner", errorOutput: "", explanation: "", starterCode: "", fixedCode: "", fixCommand: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allScenarios = useMemo(() => [...universalScenarios, ...customScenarios], [customScenarios]);
  const teaching = teachingFor(scenario);
  const visibleScenarios = useMemo(() => allScenarios.filter((item) => {
    const matchesEnvironment = item.environment === environment;
    const query = search.trim().toLowerCase();
    return matchesEnvironment && (!query || `${item.title} ${item.category} ${item.errorOutput}`.toLowerCase().includes(query));
  }), [allScenarios, environment, search]);
  const score = Math.max(100, 1000 - attempts * 45 - hintIndex * 90);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("MediaToolkit:custom-scenarios") ?? "[]") as unknown[];
      if (Array.isArray(stored)) setCustomScenarios(stored.map((item) => makeImportedScenario(item, "custom-case.json")));
    } catch { /* Ignore malformed local drafts. */ }
  }, []);

  useEffect(() => {
    setAiInput(scenario.errorOutput);
  }, [scenario]);

  function loadScenario(nextScenario: UserScenario) {
    setScenario(nextScenario);
    setEnvironment(nextScenario.environment);
    setEditor(nextScenario.starterCode);
    setTerminalLines(["MediaToolkit runtime ready", `Loaded: ${nextScenario.title}`, "Reproduce the failure, inspect evidence, then fix it."]);
    setCommand("");
    setHintIndex(0);
    setAttempts(0);
    setSolved(false);
    setAiResult(null);
  }

  function chooseEnvironment(nextEnvironment: SimulatorEnvironment) {
    setEnvironment(nextEnvironment);
    const nextScenario = allScenarios.find((item) => item.environment === nextEnvironment);
    if (nextScenario) loadScenario(nextScenario);
  }

  function markSolved(output: string) {
    setSolved(true);
    setTerminalLines((lines) => [...lines, output]);
    try {
      const current = JSON.parse(localStorage.getItem("MediaToolkit:universal-progress") ?? "{}") as Record<string, number>;
      localStorage.setItem("MediaToolkit:universal-progress", JSON.stringify({ ...current, [scenario.id]: score }));
    } catch { /* Progress is best effort. */ }
  }

  function execute(rawCommand: string) {
    const nextCommand = rawCommand.trim();
    if (!nextCommand) return;
    setAttempts((value) => value + 1);
    const normalized = normalize(nextCommand);
    if (normalized === "clear" || normalized === "cls") { setTerminalLines([]); return; }
    if (normalized === "help") {
      setTerminalLines((lines) => [...lines, `$ ${nextCommand}`, "Try the reproduce command, diagnostics, then apply a root-cause fix. This simulator never executes arbitrary code."]);
      return;
    }
    if (normalized === normalize(scenario.reproduceCommand)) {
      setTerminalLines((lines) => [...lines, `$ ${nextCommand}`, scenario.errorOutput, "exit 1"]);
      return;
    }
    const diagnostic = Object.entries(scenario.diagnosticCommands).find(([candidate]) => normalize(candidate) === normalized);
    if (diagnostic) { setTerminalLines((lines) => [...lines, `$ ${nextCommand}`, diagnostic[1] || "No output. Inspect the command and try again."]); return; }
    const fixedByCommand = scenario.fixPatterns.some((pattern) => normalized.includes(normalize(pattern)));
    const fixedByEditor = scenario.fixPatterns.some((pattern) => editor.toLowerCase().includes(pattern.toLowerCase()));
    if (fixedByCommand || (normalized === "verify" && fixedByEditor)) { markSolved(`$ ${nextCommand}\n${scenario.successOutput}`); return; }
    setTerminalLines((lines) => [...lines, `$ ${nextCommand}`, `${nextCommand}: command completed, but the failure is still present.`, "Use the observed error to choose a diagnostic command."]);
  }

  function submitCommand(event: FormEvent) { event.preventDefault(); execute(command); setCommand(""); }

  function reset() { loadScenario(scenario); }

  async function copyTerminal() {
    await navigator.clipboard.writeText(terminalLines.join("\n\n"));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  async function askAi() {
    if (aiLoading || aiInput.trim().length < 4) return;
    setAiLoading(true);
    try {
      const response = await fetch("/api/debug", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ input: `${aiInput}\n\nCode context:\n${editor}` }) });
      const payload = await response.json() as AiResult & { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "AI analysis failed");
      setAiResult(payload);
    } catch (error) {
      setTerminalLines((lines) => [...lines, `AI assistant: ${error instanceof Error ? error.message : "Could not reach the debugger"}`]);
    } finally { setAiLoading(false); }
  }

  function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    void file.text().then((text) => {
      let raw: unknown = { title: file.name, errorOutput: text, starterCode: "", fileName: file.name };
      try { raw = JSON.parse(text); } catch { /* Treat plain text and markdown as an error capture. */ }
      const imported = makeImportedScenario(raw, file.name);
      const next = [...customScenarios.filter((item) => item.id !== imported.id), imported];
      setCustomScenarios(next);
      localStorage.setItem("MediaToolkit:custom-scenarios", JSON.stringify(next));
      loadScenario(imported);
    });
    event.target.value = "";
  }

  function saveDraft(event: FormEvent) {
    event.preventDefault();
    if (!draft.title.trim() || !draft.errorOutput.trim()) return;
    const custom = makeImportedScenario({ ...draft, id: `custom-${Date.now()}`, fileName: `${draft.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")}.txt`, language: draft.environment, reproduceCommand: "run example", successOutput: "✓ Verification complete", fixPatterns: [draft.fixCommand], diagnosticCommands: { "inspect error": draft.explanation || draft.errorOutput }, hints: ["Read the error literally.", "Compare the broken and fixed examples."] , teaching: { concept: "Your debugging case", whyItHappens: draft.explanation, observe: ["Capture the first useful line.", "Name the evidence that supports your hypothesis."], steps: ["Reproduce the issue.", "Inspect the evidence.", "Apply and verify the fix."], brokenExample: draft.starterCode, fixedExample: draft.fixedCode } }, "custom-case.json");
    const next = [...customScenarios, custom];
    setCustomScenarios(next);
    localStorage.setItem("MediaToolkit:custom-scenarios", JSON.stringify(next));
    setAuthoring(false);
    loadScenario(custom);
    setDraft({ title: "", environment, category: "Custom case", difficulty: "Beginner", errorOutput: "", explanation: "", starterCode: "", fixedCode: "", fixCommand: "" });
  }

  function exportScenario() {
    const blob = new Blob([JSON.stringify(scenario, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = `${scenario.id}.json`; link.click(); URL.revokeObjectURL(url);
  }

  useEffect(() => {
    const handler = (event: KeyboardEvent) => { if ((event.ctrlKey || event.metaKey) && event.key === "Enter") execute(scenario.reproduceCommand); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const grid = focusMode
    ? `${leftOpen ? "xl:grid-cols-[240px_minmax(0,1fr)]" : "xl:grid-cols-[48px_minmax(0,1fr)]"} ${rightOpen ? "2xl:grid-cols-[240px_minmax(0,1fr)_320px]" : "2xl:grid-cols-[240px_minmax(0,1fr)_48px]"}`
    : leftOpen && rightOpen
      ? "xl:grid-cols-[240px_minmax(0,1fr)] 2xl:grid-cols-[240px_minmax(0,1fr)_320px]"
      : leftOpen
        ? "xl:grid-cols-[240px_minmax(0,1fr)]"
        : rightOpen
          ? "2xl:grid-cols-[minmax(0,1fr)_320px]"
          : "grid-cols-1";

  return (
    <div className={focusMode ? "fixed inset-0 z-[70] overflow-y-auto bg-[#f4f5fa]" : "min-h-screen bg-[#f4f5fa]"}>
      <header className="border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-[1800px] px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0"><span className="text-[10px] font-bold uppercase tracking-[.18em] text-accent">MediaToolkit learning IDE</span><h1 className="mt-0.5 truncate text-lg font-bold sm:text-xl">Debug the cause, not just the symptom</h1></div>
            <div className="flex items-center gap-2"><button type="button" onClick={() => setShowHow((value) => !value)} className="flex h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-[10px] font-bold text-accent"><BookOpen size={13} /> How to use</button><span className="hidden items-center gap-1.5 rounded-lg border border-line bg-background px-3 py-2 text-[10px] text-muted sm:flex"><Clock3 size={13} /> {scenario.estimatedTime}</span><span className="hidden items-center gap-1.5 rounded-lg border border-line bg-background px-3 py-2 text-[10px] text-muted sm:flex"><Trophy size={13} className="text-accent" /> {score} XP</span><button type="button" onClick={() => setLeftOpen((value) => !value)} className="grid size-9 place-items-center rounded-lg border border-line bg-white text-muted hover:text-accent" aria-label={leftOpen ? "Collapse scenario rail" : "Open scenario rail"}>{leftOpen ? <PanelLeftClose size={15} /> : <PanelLeftOpen size={15} />}</button><button type="button" onClick={() => setRightOpen((value) => !value)} className="grid size-9 place-items-center rounded-lg border border-line bg-white text-muted hover:text-accent" aria-label={rightOpen ? "Collapse guide rail" : "Open guide rail"}>{rightOpen ? <PanelRightClose size={15} /> : <PanelRightOpen size={15} />}</button><button type="button" onClick={() => setFocusMode((value) => !value)} className="grid size-9 place-items-center rounded-lg border border-line bg-white text-muted hover:text-accent" aria-label={focusMode ? "Exit focus mode" : "Open focus mode"}>{focusMode ? <Minimize2 size={15} /> : <Maximize2 size={15} />}</button></div>
          </div>
          {showHow ? <div className="mt-3 grid gap-2 rounded-xl border border-accent/15 bg-accent/5 p-3 sm:grid-cols-4">{[["1", "Pick a challenge", "Open the left rail or choose a tool."], ["2", "Reproduce", "Run the supplied command and read the first useful line."], ["3", "Investigate", "Try diagnostics, edit code, or ask Gemini for a hypothesis."], ["4", "Fix and verify", "Apply the smallest change, then rerun the original command."]].map(([step, title, detail]) => <div key={step} className="flex gap-2"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent text-[10px] font-bold text-white">{step}</span><span><b className="block text-[11px]">{title}</b><small className="text-[10px] leading-4 text-muted">{detail}</small></span></div>)}</div> : null}
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {simulatorEnvironments.map((item) => { const Icon = environmentIcons[item.id]; const count = allScenarios.filter((candidate) => candidate.environment === item.id).length; return <button key={item.id} type="button" onClick={() => chooseEnvironment(item.id)} className={`flex min-w-fit items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold transition ${environment === item.id ? "border-accent bg-accent text-white" : "border-line bg-white text-muted hover:border-accent/40 hover:text-accent"}`}><Icon size={14} /> {item.label}<span className={`rounded-full px-1.5 py-0.5 text-[9px] ${environment === item.id ? "bg-white/20" : "bg-background"}`}>{count}</span></button>; })}
          </div>
        </div>
      </header>

      <main className={`mx-auto grid max-w-[1800px] gap-3 px-4 py-4 sm:px-6 ${grid}`}>
        {leftOpen ? <aside className="app-card order-2 self-start overflow-hidden 2xl:order-1 2xl:sticky 2xl:top-4"><div className="flex items-center justify-between border-b border-line p-3"><span className="text-[10px] font-bold uppercase tracking-wide text-faint">Challenge library</span><button type="button" onClick={() => setAuthoring(true)} className="grid size-7 place-items-center rounded-md bg-accent text-white" aria-label="Create a challenge"><Plus size={14} /></button></div><div className="border-b border-line p-3"><label className="flex h-9 items-center gap-2 rounded-lg border border-line bg-background px-3 text-xs text-faint"><Search size={14} /><input value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent outline-none" placeholder="Search errors" /></label><div className="mt-2 flex gap-2"><button type="button" onClick={() => fileInputRef.current?.click()} className="flex flex-1 items-center justify-center gap-1 rounded-md border border-line px-2 py-2 text-[10px] font-bold text-muted hover:text-accent"><FileUp size={13} /> Import</button><button type="button" onClick={exportScenario} className="flex flex-1 items-center justify-center gap-1 rounded-md border border-line px-2 py-2 text-[10px] font-bold text-muted hover:text-accent"><Download size={13} /> Export</button></div></div><div className="max-h-[calc(100vh-260px)] overflow-y-auto p-2">{visibleScenarios.map((item) => <button key={item.id} type="button" onClick={() => loadScenario(item)} className={`mb-1 block w-full rounded-lg border p-3 text-left transition ${scenario.id === item.id ? "border-accent/30 bg-accent/8" : "border-transparent hover:bg-background"}`}><span className="flex items-start justify-between gap-2"><b className="text-xs leading-5">{item.title}</b><ChevronRight size={13} className={scenario.id === item.id ? "mt-1 text-accent" : "mt-1 text-faint"} /></span><span className="mt-2 flex items-center gap-2 text-[10px] text-faint"><span>{item.category}</span><span>•</span><span>{item.difficulty}</span>{item.id.startsWith("custom-") ? <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-emerald-700">Your case</span> : null}</span></button>)}</div></aside> : <aside className="order-2 hidden 2xl:block"><button type="button" onClick={() => setLeftOpen(true)} className="grid size-12 place-items-center rounded-xl border border-line bg-white text-muted hover:text-accent" aria-label="Open scenario rail"><PanelLeftOpen size={17} /></button></aside>}

        <section className="order-1 min-w-0 overflow-hidden rounded-2xl border border-[#272c37] bg-[#0b0e14] shadow-[0_18px_50px_rgba(25,28,45,.18)] 2xl:order-2" data-testid="universal-workspace">
          <div className="flex min-h-12 flex-wrap items-center justify-between gap-3 border-b border-[#252a35] bg-[#151923] px-4 py-2"><div className="flex min-w-0 items-center gap-3"><span className="flex shrink-0 gap-1.5"><i className="size-2.5 rounded-full bg-[#ff5f57]" /><i className="size-2.5 rounded-full bg-[#febc2e]" /><i className="size-2.5 rounded-full bg-[#28c840]" /></span><span className="truncate font-mono text-[11px] text-[#9da7b5]">MediaToolkit / {environment} / {scenario.id}</span></div><div className="flex gap-2"><button type="button" onClick={reset} className="flex h-8 items-center gap-1.5 rounded-lg border border-[#303644] px-3 text-[10px] font-bold text-[#aab3c0]"><RotateCcw size={12} /> Reset</button><button type="button" onClick={() => execute(scenario.reproduceCommand)} className="flex h-8 items-center gap-1.5 rounded-lg bg-accent px-3 text-[10px] font-bold text-white"><Play size={12} /> Reproduce</button></div></div>
          <div className={`grid ${focusMode ? "min-h-[calc(100vh-205px)]" : "min-h-[500px]"} grid-rows-[minmax(190px,.8fr)_minmax(220px,1fr)]`}><div className="min-h-0 border-b border-[#252a35]"><div className="flex h-10 items-center gap-2 border-b border-[#252a35] bg-[#11151d] px-4 font-mono text-[10px] text-[#9da7b5]"><FileCode2 size={13} className="text-[#8b8cf8]" /> {scenario.fileName}<span className="text-[#565f6d]">{scenario.language}</span><span className="ml-auto text-[#565f6d]">Ctrl + Enter to reproduce</span></div><textarea value={editor} onChange={(event) => { setEditor(event.target.value); setSolved(false); }} spellCheck={false} className="h-[calc(100%-40px)] min-h-[150px] w-full resize-none bg-[#0d1117] p-4 font-mono text-[12px] leading-6 text-[#d4d9e2] outline-none" aria-label="Universal simulator editor" /></div><div className="flex min-h-0 flex-col" data-testid="universal-terminal"><div className="flex h-10 items-center justify-between border-b border-[#252a35] bg-[#11151d] px-4"><span className="flex items-center gap-2 font-mono text-[10px] text-[#9da7b5]"><Terminal size={13} className="text-[#8b8cf8]" /> {simulatorEnvironments.find((item) => item.id === environment)?.label} runtime</span><button type="button" onClick={copyTerminal} className="flex items-center gap-1 text-[10px] text-[#7f8998]"><Copy size={12} /> {copied ? "Copied" : "Copy output"}</button></div><pre className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap p-4 font-mono text-[11px] leading-5 text-[#b8c0cc]" aria-live="polite">{terminalLines.join("\n\n")}</pre><form onSubmit={submitCommand} className="flex min-h-11 items-center gap-2 border-t border-[#252a35] bg-[#0d1117] px-4"><span className="font-mono text-sm text-[#71e6a5]">$</span><input value={command} onChange={(event) => setCommand(event.target.value)} className="min-w-0 flex-1 bg-transparent font-mono text-[12px] text-white outline-none placeholder:text-[#596271]" placeholder={`Try: ${scenario.reproduceCommand}`} aria-label="Universal terminal command" /><button type="submit" className="grid size-8 place-items-center rounded-lg bg-[#242a36] text-[#adb6c4]" aria-label="Run command"><Send size={13} /></button></form></div></div>
        </section>

        {rightOpen ? <aside className="app-card order-3 self-start overflow-hidden 2xl:sticky 2xl:top-4"><div className="flex border-b border-line"><button type="button" onClick={() => setGuideTab("learn")} className={`flex-1 px-3 py-3 text-[10px] font-bold uppercase tracking-wide ${guideTab === "learn" ? "border-b-2 border-accent text-accent" : "text-faint"}`}><BookOpen size={13} className="mr-1 inline" /> Learn</button><button type="button" onClick={() => setGuideTab("ai")} className={`flex-1 px-3 py-3 text-[10px] font-bold uppercase tracking-wide ${guideTab === "ai" ? "border-b-2 border-accent text-accent" : "text-faint"}`}><Sparkles size={13} className="mr-1 inline" /> Gemini</button></div>{guideTab === "learn" ? <div><div className="border-b border-line p-4"><span className="text-[10px] font-bold uppercase tracking-wide text-accent">Challenge brief</span><h2 className="mt-2 text-base font-bold leading-6">{scenario.title}</h2><div className="mt-3 flex flex-wrap gap-2"><span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">{scenario.difficulty}</span><span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-700">{scenario.category}</span></div></div><div className="space-y-5 p-4"><section><span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-faint"><Info size={12} /> What is happening?</span><p className="mt-2 text-xs leading-6 text-muted">{teaching.whyItHappens}</p></section><section><span className="text-[10px] font-bold uppercase tracking-wide text-faint">Learn this concept</span><p className="mt-2 text-sm font-bold">{teaching.concept}</p><ul className="mt-2 space-y-2 text-xs leading-5 text-muted">{teaching.observe.map((item) => <li key={item} className="flex gap-2"><span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />{item}</li>)}</ul></section><section><span className="text-[10px] font-bold uppercase tracking-wide text-faint">Debugging path</span><ol className="mt-2 space-y-2">{teaching.steps.map((item, index) => <li key={item} className="flex gap-2 text-xs leading-5 text-muted"><span className="grid size-5 shrink-0 place-items-center rounded-full bg-accent/10 text-[10px] font-bold text-accent">{index + 1}</span>{item}</li>)}</ol></section><section><span className="text-[10px] font-bold uppercase tracking-wide text-faint">Defined example</span><div className="mt-2 overflow-hidden rounded-lg border border-line"><div className="border-b border-line bg-background px-3 py-2 text-[10px] font-bold text-muted">Broken → corrected</div><pre className="max-h-44 overflow-auto whitespace-pre-wrap bg-[#10131a] p-3 font-mono text-[10px] leading-5 text-[#d4d9e2]">{teaching.brokenExample}\n\n→\n\n{teaching.fixedExample}</pre></div></section><section><span className="text-[10px] font-bold uppercase tracking-wide text-faint">Hints</span>{scenario.hints.slice(0, hintIndex).map((hint, index) => <div key={hint} className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900"><b>Hint {index + 1}.</b> {hint}</div>)}<button type="button" onClick={() => setHintIndex((value) => Math.min(scenario.hints.length, value + 1))} disabled={hintIndex >= scenario.hints.length} className="mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-line text-xs font-bold text-accent disabled:opacity-40"><Lightbulb size={13} /> {hintIndex >= scenario.hints.length ? "All hints revealed" : "Reveal next hint"}</button></section></div>{solved ? <div className="border-t border-emerald-200 bg-emerald-50 p-4"><span className="flex items-center gap-2 text-sm font-bold text-emerald-700"><CheckCircle2 size={17} /> Environment healthy</span><p className="mt-2 text-xs leading-5 text-emerald-800">Verified at {score} XP. Keep the evidence in your notes.</p></div> : <div className="border-t border-line p-4"><div className="flex items-center justify-between text-xs"><span className="text-muted">Current score</span><b className="text-accent">{score} XP</b></div><div className="mt-2 h-1.5 rounded-full bg-line-soft"><div className="h-full rounded-full bg-accent" style={{ width: `${score / 10}%` }} /></div></div>}</div> : <div className="space-y-4 p-4"><div className="rounded-xl border border-accent/20 bg-accent/5 p-3"><span className="flex items-center gap-2 text-xs font-bold text-accent"><Sparkles size={15} /> Pair with Gemini</span><p className="mt-2 text-xs leading-5 text-muted">Ask for a root-cause explanation, safer fixes, and a learning path for the code currently in the editor.</p></div><textarea value={aiInput} onChange={(event) => setAiInput(event.target.value)} className="min-h-28 w-full resize-y rounded-lg border border-line bg-background p-3 font-mono text-[11px] leading-5 outline-none" placeholder="Paste an error or leave the scenario error..." /><button type="button" onClick={askAi} disabled={aiLoading || aiInput.trim().length < 4} className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-accent text-xs font-bold text-white disabled:opacity-50"><Sparkles size={14} /> {aiLoading ? "Gemini is reading the evidence…" : "Explain with Gemini"}</button>{aiResult ? <div className="space-y-3"><div className="rounded-lg border border-line bg-background p-3"><div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-wide text-faint">{aiResult.provider === "gemini" ? "Gemini analysis" : aiResult.source === "ai" ? "AI analysis" : "Local fallback"}</span><span className="text-[10px] font-bold text-accent">{aiResult.confidence}% confidence</span></div><p className="mt-2 text-xs font-bold leading-5">{aiResult.summary}</p><p className="mt-2 text-xs leading-5 text-muted">{aiResult.rootCause}</p></div>{aiResult.fixes.slice(0, 2).map((fix) => <div key={fix.title} className="rounded-lg border border-line p-3"><span className="text-xs font-bold">{fix.title}</span><p className="mt-1 text-xs leading-5 text-muted">{fix.explanation}</p><div className="mt-2 space-y-1">{fix.commands.map((item) => <button key={item} type="button" onClick={() => setCommand(item)} className="block w-full truncate rounded bg-[#10131a] px-2 py-1.5 text-left font-mono text-[10px] text-[#71e6a5]">$ {item}</button>)}</div></div>)}</div> : <p className="text-center text-xs leading-5 text-faint">No AI notes yet. Your key stays server-side; only the error and code context are sent to the configured debugger.</p>}</div>}</aside> : <aside className="order-3 hidden 2xl:block"><button type="button" onClick={() => setRightOpen(true)} className="grid size-12 place-items-center rounded-xl border border-line bg-white text-muted hover:text-accent" aria-label="Open guide rail"><PanelRightOpen size={17} /></button></aside>}
      </main>

      <input ref={fileInputRef} type="file" accept=".json,.md,.txt" onChange={handleImport} className="hidden" />
      <div className="mx-auto flex max-w-[1800px] items-center justify-between px-4 pb-6 text-[10px] text-faint sm:px-6"><span>Local cases stay in this browser until you export them.</span><button type="button" onClick={() => setAuthoring(true)} className="flex items-center gap-1 font-bold text-accent"><Upload size={12} /> Add your own failure</button></div>

      {authoring ? <div className="fixed inset-0 z-[90] grid place-items-center bg-[#080a0f]/65 p-4 backdrop-blur-sm"><form onSubmit={saveDraft} className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-line bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-line p-5"><div><span className="text-[10px] font-bold uppercase tracking-wide text-accent">Content studio</span><h2 className="mt-1 text-xl font-bold">Create a debugging challenge</h2><p className="mt-1 text-xs text-muted">Turn a real failure into a teachable, repeatable exercise.</p></div><button type="button" onClick={() => setAuthoring(false)} className="grid size-8 place-items-center rounded-lg border border-line text-muted" aria-label="Close content studio"><X size={15} /></button></div><div className="grid gap-4 p-5 sm:grid-cols-2"><label className="sm:col-span-2"><span className="field-label">Title</span><input required value={draft.title} onChange={(event) => setDraft((value) => ({ ...value, title: event.target.value }))} className="field-input" placeholder="e.g. API returns 401 after token refresh" /></label><label><span className="field-label">Tool / environment</span><select value={draft.environment} onChange={(event) => setDraft((value) => ({ ...value, environment: event.target.value as SimulatorEnvironment }))} className="field-input">{simulatorEnvironments.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><label><span className="field-label">Difficulty</span><select value={draft.difficulty} onChange={(event) => setDraft((value) => ({ ...value, difficulty: event.target.value as DraftChallenge["difficulty"] }))} className="field-input"><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label><label className="sm:col-span-2"><span className="field-label">Error output / stack trace</span><textarea required value={draft.errorOutput} onChange={(event) => setDraft((value) => ({ ...value, errorOutput: event.target.value }))} className="field-input min-h-28 font-mono" placeholder="Paste the exact error here" /></label><label className="sm:col-span-2"><span className="field-label">Explanation: why does it happen?</span><textarea value={draft.explanation} onChange={(event) => setDraft((value) => ({ ...value, explanation: event.target.value }))} className="field-input min-h-24" placeholder="Explain the root cause in beginner-friendly language" /></label><label><span className="field-label">Broken code example</span><textarea value={draft.starterCode} onChange={(event) => setDraft((value) => ({ ...value, starterCode: event.target.value }))} className="field-input min-h-32 font-mono" placeholder="Paste the code that fails" /></label><label><span className="field-label">Fixed code example</span><textarea value={draft.fixedCode} onChange={(event) => setDraft((value) => ({ ...value, fixedCode: event.target.value }))} className="field-input min-h-32 font-mono" placeholder="Paste the corrected code" /></label><label className="sm:col-span-2"><span className="field-label">Fix command or verification phrase</span><input value={draft.fixCommand} onChange={(event) => setDraft((value) => ({ ...value, fixCommand: event.target.value }))} className="field-input font-mono" placeholder="e.g. npm install, add .js extension, verify" /></label></div><div className="flex flex-wrap justify-end gap-2 border-t border-line bg-background p-5"><button type="button" onClick={() => setAuthoring(false)} className="rounded-lg border border-line px-4 py-2 text-xs font-bold text-muted">Cancel</button><button type="submit" className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-xs font-bold text-white"><Check size={14} /> Save challenge</button></div></form></div> : null}
    </div>
  );
}
