import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="section-shell flex flex-col gap-3 py-7 text-xs text-faint sm:flex-row sm:items-center sm:justify-between">
        <span>© 2026 MediaToolkit. Learn debugging by doing.</span>
        <nav className="flex flex-wrap gap-5">
          <Link href="/tutorials" className="hover:text-accent">Tutorials</Link>
          <Link href="/about" className="hover:text-accent">About</Link>
          <Link href="/contact" className="hover:text-accent">Contact</Link>
          <Link href="/terms" className="hover:text-accent">Terms</Link>
          <Link href="/privacy" className="hover:text-accent">Privacy</Link>
          <Link href="/admin" className="hover:text-accent">Content studio</Link>
        </nav>
      </div>
    </footer>
  );
}
