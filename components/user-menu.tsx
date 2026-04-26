'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiRequest, logout } from '@/lib/api';
import { UserMenuItem } from '@/lib/types';

const fallbackMenu: UserMenuItem[] = [
  { id: 'profile', label: 'Profile', href: '/profile', action: 'navigate' },
  { id: 'spaces', label: 'My Spaces', href: '/spaces', action: 'navigate' },
  { id: 'support', label: 'Help & Support', href: '/support', action: 'navigate' },
  { id: 'contact', label: 'Contact Us', href: '/contact', action: 'navigate' },
  { id: 'logout', label: 'Logout', href: null, action: 'logout' },
];

interface UserMenuProps {
  initials?: string;
}

export function UserMenu({ initials = 'SC' }: UserMenuProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<UserMenuItem[]>(fallbackMenu);

  useEffect(() => {
    void apiRequest<UserMenuItem[]>('/navigation/user-menu')
      .then(setItems)
      .catch(() => setItems(fallbackMenu));
  }, []);

  async function handleLogout() {
    await logout();
    setIsOpen(false);
    router.push('/');
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex items-center gap-3 rounded-full border border-ink/10 bg-white/85 px-3 py-2 text-sm font-semibold shadow-lg shadow-slate-900/10 backdrop-blur transition hover:-translate-y-0.5"
        aria-expanded={isOpen}
        aria-label="Open user menu"
      >
        <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-white">{initials}</span>
        <span className="text-xl leading-none">⋮</span>
      </button>

      {isOpen ? (
        <div className="absolute right-0 z-50 mt-3 w-60 overflow-hidden rounded-3xl border border-white/80 bg-white/95 p-2 shadow-2xl shadow-slate-900/15 backdrop-blur">
          {items.map((item) =>
            item.action === 'logout' ? (
              <button
                key={item.id}
                type="button"
                onClick={() => void handleLogout()}
                className="block w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                {item.label}
              </button>
            ) : (
              <Link
                key={item.id}
                href={item.href ?? '#'}
                onClick={() => setIsOpen(false)}
                className="block rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                {item.label}
              </Link>
            ),
          )}
        </div>
      ) : null}
    </div>
  );
}
