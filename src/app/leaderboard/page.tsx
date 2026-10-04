import type { Metadata } from "next";
import { Crown, Medal, Trophy } from "lucide-react";

export const metadata: Metadata = {
  title: "Leaderboard",
  description: "Community rankings by verified debugging scenario score.",
  robots: { index: false, follow: true },
};

const leaders = [
  ["Amina K.", "Python Pathfinder", 12480, 38],
  ["David M.", "Git Guardian", 11720, 35],
  ["Sofia R.", "Runtime Ranger", 10960, 33],
  ["Noah T.", "Dependency Detective", 9840, 30],
  ["Liam P.", "Terminal Tactician", 9120, 28],
];

export default function LeaderboardPage() {
  return (
    <div className="section-shell py-8 sm:py-10">
      <span className="text-sm font-semibold text-accent">Community rankings</span>
      <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Leaderboard</h1>
      <p className="mt-2 text-sm text-muted">Ranked by verified scenario score. Hint efficiency and clean fixes matter.</p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {leaders.slice(0,3).map(([name,title,score,completed],index) => <div key={String(name)} className={`app-card p-6 ${index===0?"border-accent/40 bg-[#f5f3ff]":""}`}><span className={`grid size-11 place-items-center rounded-xl ${index===0?"bg-amber-100 text-amber-600":index===1?"bg-slate-100 text-slate-500":"bg-orange-100 text-orange-600"}`}>{index===0?<Crown size={21}/>:<Medal size={21}/>}</span><strong className="mt-5 block text-lg">#{index+1} {name}</strong><span className="text-sm text-muted">{title}</span><div className="mt-5 flex justify-between border-t border-line pt-4"><b className="text-accent">{Number(score).toLocaleString()} XP</b><small className="text-faint">{completed} solved</small></div></div>)}
      </div>

      <section className="app-card mt-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-6 py-5"><h2 className="text-xl font-bold">All-time ranking</h2><Trophy size={20} className="text-accent" /></div>
        <div className="divide-y divide-line-soft">
          {leaders.map(([name,title,score,completed],index) => <div key={String(name)} className="grid grid-cols-[40px_1fr_auto] items-center gap-3 px-6 py-5 sm:grid-cols-[50px_1fr_130px_100px]"><b className="text-muted">#{index+1}</b><span><strong className="block text-sm">{name}</strong><small className="text-faint">{title}</small></span><b className="text-right text-accent">{Number(score).toLocaleString()} XP</b><span className="hidden text-right text-xs text-faint sm:block">{completed} completed</span></div>)}
        </div>
      </section>
    </div>
  );
}
