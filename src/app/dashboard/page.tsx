import type { Metadata } from "next";
import { Award, CheckCircle2, Clock3, Flame, Target, TrendingUp } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Your progress",
  description: "Track completed debugging scenarios, scores, and consistency.",
  robots: { index: false, follow: true },
};

const history = [
  ["Python package in the wrong environment", "Dependencies", 920, "8 min"],
  ["Git conflict resolution", "Git", 840, "12 min"],
  ["Undefined property in JavaScript", "Runtime", 780, "9 min"],
];

export default function ProgressPage() {
  return (
    <div className="section-shell py-8 sm:py-10">
      <span className="text-sm font-semibold text-accent">Your progress</span>
      <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Debugging skills are growing.</h1>
      <p className="mt-2 text-sm text-muted">Track completed scenarios, scores, consistency, and the areas to revisit next.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [CheckCircle2, "12", "Labs completed", "text-emerald-600 bg-emerald-50"],
          [Award, "846", "Average score", "text-indigo-600 bg-indigo-50"],
          [Flame, "4 days", "Current streak", "text-orange-600 bg-orange-50"],
          [TrendingUp, "+18%", "This month", "text-violet-600 bg-violet-50"],
        ].map(([Icon, value, label, tone]) => {
          const StatIcon = Icon as typeof Award;
          return <div key={String(label)} className="app-card p-5"><span className={`grid size-10 place-items-center rounded-xl ${String(tone)}`}><StatIcon size={19} /></span><strong className="mt-5 block text-2xl">{String(value)}</strong><span className="text-sm text-muted">{String(label)}</span></div>;
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
        <section className="app-card p-6">
          <div className="flex items-center justify-between"><h2 className="text-xl font-bold">Category mastery</h2><Target size={20} className="text-accent" /></div>
          <div className="mt-6 grid gap-5">
            {[["Dependencies",72],["Git",58],["Runtime",44],["Permissions",36],["Configuration",29]].map(([label,value]) => <div key={String(label)}><div className="flex justify-between text-sm"><span className="font-semibold">{label}</span><b>{value}%</b></div><div className="mt-2 h-2 rounded-full bg-line-soft"><div className="h-full rounded-full bg-accent" style={{width:`${value}%`}} /></div></div>)}
          </div>
        </section>

        <section className="app-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-6 py-5"><h2 className="text-xl font-bold">Recent completions</h2><Link href="/labs" className="text-sm font-bold text-accent">Practice more</Link></div>
          <div className="divide-y divide-line-soft">
            {history.map(([title, category, score, time]) => <div key={String(title)} className="grid gap-3 px-6 py-5 sm:grid-cols-[1fr_auto_auto] sm:items-center"><span><strong className="block text-sm">{title}</strong><small className="text-faint">{category}</small></span><span className="font-bold text-accent">{score} XP</span><span className="flex items-center gap-1 text-xs text-faint"><Clock3 size={13} /> {time}</span></div>)}
          </div>
        </section>
      </div>
    </div>
  );
}
