'use client';

import Link from 'next/link';

const navItems = [
  { label: 'Trial', href: '/explore-trial' },
  { label: 'Spaces', href: '/spaces' },
  { label: 'Support', href: '/support' },
  { label: 'Contact', href: '/contact' },
];

interface NavLeftSectionProps {
  pathname: string;
}

export function NavLeftSection({ pathname }: NavLeftSectionProps) {
  return (
    <nav className="hidden items-center justify-center gap-2 lg:flex" aria-label="Primary navigation">
      {navItems.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-full px-4 py-2 text-sm font-bold transition hover:-translate-y-0.5 ${
              active ? 'bg-ink text-white shadow-lg shadow-slate-900/15' : 'text-slate-600 hover:bg-white'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
