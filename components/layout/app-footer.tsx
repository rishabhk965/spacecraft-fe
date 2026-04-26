import Link from 'next/link';

export function AppFooter() {
  return (
    <footer className="border-t border-white/60 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-5 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
        <p className="font-semibold">SpaceCraft.ai system shell, ready for 3D workspace expansion.</p>
        <nav className="flex flex-wrap gap-4" aria-label="Footer navigation">
          <Link href="/support" className="font-bold transition hover:text-ink">Support</Link>
          <Link href="/contact" className="font-bold transition hover:text-ink">Contact</Link>
          <span className="font-bold">v0.1</span>
        </nav>
      </div>
    </footer>
  );
}
