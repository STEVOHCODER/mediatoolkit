import Link from "next/link";

export function Brand() {
  return (
    <Link href="/" className="inline-flex items-center gap-3 font-extrabold text-foreground">
      <span className="relative grid size-9 place-items-center rounded-xl bg-accent text-white shadow-sm">
        <span className="font-mono text-sm">&gt;_</span>
      </span>
      <span className="text-lg tracking-tight">MediaToolkit</span>
    </Link>
  );
}
