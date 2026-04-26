import Link from 'next/link';

interface SpaceCraftLogoProps {
  tone?: 'light' | 'dark';
}

export function SpaceCraftLogo({ tone = 'light' }: SpaceCraftLogoProps) {
  const textClass = tone === 'dark' ? 'text-white' : 'text-ink';
  const mutedClass = tone === 'dark' ? 'text-cyan-100/80' : 'text-slate-500';

  return (
    <Link href="/" className="group inline-flex items-center gap-3 rounded-3xl outline-none transition hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-cyan-300/40">
      <span className="relative grid h-12 w-12 place-items-center rounded-2xl border border-cyan-300/40 bg-slate-950 shadow-lg shadow-cyan-950/20">
        <svg aria-hidden="true" viewBox="0 0 48 48" className="h-8 w-8">
          <circle cx="24" cy="24" r="15" fill="none" stroke="#67e8f9" strokeWidth="2.4" />
          <path d="M10 28c9-12 19-14 30-8" fill="none" stroke="#fbbf24" strokeLinecap="round" strokeWidth="2.6" />
          <path d="M28 8c5 8 5 22-2 32" fill="none" stroke="#c4b5fd" strokeLinecap="round" strokeWidth="2.2" />
          <circle cx="31" cy="17" r="3" fill="#f8fafc" />
        </svg>
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.95)]" />
      </span>
      <span className="leading-none">
        <span className={`block text-sm font-black uppercase tracking-[0.32em] ${textClass}`}>SpaceCraft</span>
        <span className={`mt-1 block text-xs font-black lowercase tracking-[0.24em] ${mutedClass}`}>spacecraft.ai</span>
      </span>
    </Link>
  );
}
