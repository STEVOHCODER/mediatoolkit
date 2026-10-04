"use client";

import {
  ArrowRight,
  Bot,
  Braces,
  Cloud,
  Code2,
  Container,
  Database,
  GitBranch,
  HardDrive,
  Laptop,
  LockKeyhole,
  Server,
  Terminal,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { LabDefinition } from "@/lib/labs-data";
import { labs } from "@/lib/labs-data";

const iconMap = {
  python: Braces,
  react: Code2,
  javascript: Braces,
  node: Server,
  docker: Container,
  git: GitBranch,
  vscode: Laptop,
  linux: Terminal,
  database: Database,
  cloud: Cloud,
  ai: Bot,
};

const filterOptions = ["All", "Languages", "Systems", "Tools", "Cloud", "AI"] as const;
type Filter = (typeof filterOptions)[number];

const accentMap: Record<string, string> = {
  python: "text-[#ffd34e] bg-[#ffd34e]/10 border-[#ffd34e]/25",
  react: "text-[#67d5f5] bg-[#67d5f5]/10 border-[#67d5f5]/25",
  javascript: "text-[#f7df1e] bg-[#f7df1e]/10 border-[#f7df1e]/25",
  node: "text-[#83cd29] bg-[#83cd29]/10 border-[#83cd29]/25",
  docker: "text-[#79c7ff] bg-[#79c7ff]/10 border-[#79c7ff]/25",
  git: "text-[#f07035] bg-[#f07035]/10 border-[#f07035]/25",
  vscode: "text-[#75beff] bg-[#75beff]/10 border-[#75beff]/25",
  linux: "text-[#e7c861] bg-[#e7c861]/10 border-[#e7c861]/25",
  database: "text-[#a78bfa] bg-[#a78bfa]/10 border-[#a78bfa]/25",
  cloud: "text-[#8bd5ff] bg-[#8bd5ff]/10 border-[#8bd5ff]/25",
  ai: "text-accent bg-accent/10 border-accent/25",
};

function loadProgress(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem("MediaToolkit:labs-progress") ?? "{}") as Record<string, number>;
  } catch {
    return {};
  }
}

export function LabsCatalog({
  isolatedRunnerConfigured,
}: {
  isolatedRunnerConfigured: boolean;
}) {
  const [filter, setFilter] = useState<Filter>("All");
  const [progress, setProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    const timer = window.setTimeout(() => setProgress(loadProgress()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const visibleLabs = labs.filter((lab) => filter === "All" || lab.group === filter);
  const completedChallenges = Object.values(progress).reduce((total, value) => total + value, 0);
  const totalChallenges = labs.reduce((total, lab) => total + lab.challengeCount, 0);
  const overallProgress = totalChallenges ? Math.round((completedChallenges / totalChallenges) * 100) : 0;

  return (
    <div>
      <header className="border-b border-line-soft bg-surface/30">
        <div className="section-shell py-14 sm:py-20">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <span className="eyebrow">MediaToolkit Labs</span>
              <h1 className="mt-5 text-4xl leading-tight font-semibold sm:text-6xl">
                Learn debugging by doing.
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-muted">
                Practice solving realistic software failures inside safe, interactive
                environments. Observe the evidence, form a hypothesis, apply the fix,
                and verify the result.
              </p>
              <div className="mt-8 flex flex-wrap gap-2">
                <Link
                  href="/playground"
                  className="inline-flex h-10 items-center gap-2 rounded-md bg-accent px-4 text-[10px] font-extrabold text-[#04110b]"
                >
                  Open universal playground <ArrowRight size={14} />
                </Link>
                <Link
                  href="/debug"
                  className="inline-flex h-10 items-center gap-2 rounded-md border border-line px-4 text-[10px] font-bold text-muted hover:text-foreground"
                >
                  Bring your own error <Terminal size={13} />
                </Link>
              </div>
            </div>
            <div className="grid min-w-64 grid-cols-2 border-y border-line py-4 sm:grid-cols-3">
              <div className="px-4">
                <strong className="block font-mono text-2xl font-medium">{labs.length}</strong>
                <span className="text-[8px] uppercase text-faint">labs</span>
              </div>
              <div className="border-l border-line px-4">
                <strong className="block font-mono text-2xl font-medium">{totalChallenges}</strong>
                <span className="text-[8px] uppercase text-faint">scenarios</span>
              </div>
              <div className="col-span-2 mt-4 border-t border-line px-4 pt-4 sm:col-span-1 sm:mt-0 sm:border-t-0 sm:border-l sm:pt-0">
                <strong className="block font-mono text-2xl font-medium">{overallProgress}%</strong>
                <span className="text-[8px] uppercase text-faint">your progress</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="section-shell py-10 sm:py-14">
        <div className="flex flex-col gap-5 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="font-mono text-[9px] uppercase text-accent">Choose an environment</span>
            <h2 className="mt-2 text-2xl font-semibold">Start with the stack you use.</h2>
          </div>
          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filter labs">
            {filterOptions.map((option) => (
              <button
                key={option}
                type="button"
                role="tab"
                aria-selected={filter === option}
                onClick={() => setFilter(option)}
                className={`h-8 rounded border px-3 text-[9px] font-bold transition-colors ${
                  filter === option
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-line text-muted hover:text-foreground"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-7 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visibleLabs.map((lab) => (
            <LabCard
              key={lab.slug}
              lab={lab}
              progress={progress[lab.slug] ?? 0}
              isolatedRunnerConfigured={isolatedRunnerConfigured}
            />
          ))}
        </div>
      </section>

      <section className="border-y border-line-soft bg-surface/35 py-16">
        <div className="section-shell grid gap-8 lg:grid-cols-[.7fr_1.3fr] lg:items-start">
          <div>
            <span className="eyebrow">The debugging loop</span>
            <h2 className="mt-4 text-3xl font-semibold">Professional habits, made playable.</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["01", "Observe", "Read the terminal, logs, code, and environment before touching the fix."],
              ["02", "Hypothesize", "Use evidence to name the smallest likely root cause."],
              ["03", "Apply", "Change one thing and keep a record of what you expected to happen."],
              ["04", "Verify", "Run the check, interpret the output, and reflect on prevention."],
            ].map(([number, title, copy]) => (
              <div key={number} className="border-t border-line pt-4">
                <span className="font-mono text-[9px] text-accent">{number}</span>
                <strong className="mt-2 block text-[11px]">{title}</strong>
                <p className="mt-1 text-[9px] leading-5 text-faint">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function LabCard({
  lab,
  progress,
  isolatedRunnerConfigured,
}: {
  lab: LabDefinition;
  progress: number;
  isolatedRunnerConfigured: boolean;
}) {
  const Icon = iconMap[lab.icon as keyof typeof iconMap] ?? HardDrive;
  const tone = accentMap[lab.icon] ?? "text-accent bg-accent/10 border-accent/25";
  const percent = Math.min(100, Math.round((progress / lab.challengeCount) * 100));

  return (
    <Link
      href={`/labs/${lab.slug}`}
      className="group flex min-h-72 flex-col justify-between rounded-md border border-line bg-surface p-5 transition-colors hover:border-accent/60"
    >
      <div>
        <div className="flex items-start justify-between gap-4">
          <span className={`grid size-10 place-items-center rounded-md border ${tone}`}>
            <Icon size={20} />
          </span>
          <span className="flex items-center gap-1 font-mono text-[8px] text-faint">
            <LockKeyhole size={10} />
            {isolatedRunnerConfigured ? "isolated runtime" : "guided verifier"}
          </span>
        </div>
        <strong className="mt-5 block text-lg">{lab.name}</strong>
        <p className="mt-2 min-h-12 text-[10px] leading-5 text-muted">{lab.description}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {lab.skills.map((skill) => (
            <span key={skill} className="rounded border border-line px-2 py-1 font-mono text-[8px] text-faint">
              {skill}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-6 border-t border-line-soft pt-4">
        <div className="flex items-center justify-between font-mono text-[8px] text-faint">
          <span>{lab.difficulty}</span>
          <span>{lab.estimatedTime}</span>
          <span>{lab.challengeCount} challenges</span>
        </div>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${percent}%` }} />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[9px] font-bold text-muted">
            <Trophy size={12} className="text-accent" /> {percent}% complete
          </span>
          <ArrowRight size={14} className="text-faint transition-transform group-hover:translate-x-1 group-hover:text-accent" />
        </div>
      </div>
    </Link>
  );
}
