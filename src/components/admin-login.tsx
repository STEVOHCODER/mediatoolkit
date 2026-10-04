"use client";

import { KeyRound, LoaderCircle, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminLogin({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/admin/session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const payload = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(payload.error ?? "Sign-in failed.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="section-shell grid min-h-[72vh] place-items-center py-16">
      <form onSubmit={submit} className="w-full max-w-md rounded-lg border border-line bg-surface p-6 shadow-[0_24px_80px_rgba(0,0,0,.28)]">
        <span className="grid size-10 place-items-center rounded-md border border-accent/25 bg-accent/10 text-accent">
          <ShieldCheck size={18} />
        </span>
        <h1 className="mt-5 text-2xl font-semibold">MediaToolkit admin</h1>
        <p className="mt-2 text-xs leading-6 text-muted">
          Manage verified errors, debugging methods, tutorials, commands, FAQs, and
          publication status.
        </p>
        {!configured ? (
          <div className="mt-5 rounded-md border border-[#e7c861]/25 bg-[#e7c861]/8 p-3 text-[10px] leading-5 text-[#e7d89f]">
            Set <code className="font-mono">MediaToolkit_ADMIN_TOKEN</code> in your environment before signing in.
          </div>
        ) : null}
        <label className="mt-6 block text-[9px] font-bold uppercase text-faint" htmlFor="admin-token">
          Admin token
        </label>
        <div className="mt-2 flex h-11 items-center gap-2 rounded-md border border-line bg-background px-3">
          <KeyRound size={14} className="text-faint" />
          <input
            id="admin-token"
            type="password"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            className="min-w-0 flex-1 bg-transparent font-mono text-[11px] outline-none"
            autoComplete="current-password"
          />
        </div>
        {error ? <p className="mt-3 text-[10px] text-[#ff8795]">{error}</p> : null}
        <button
          type="submit"
          disabled={!configured || loading}
          className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-accent text-[11px] font-extrabold text-[#04110b] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? <LoaderCircle size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
          Open admin workspace
        </button>
      </form>
    </div>
  );
}
