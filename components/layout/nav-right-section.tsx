'use client';

import Link from 'next/link';
import { UserMenu } from '@/components/user-menu';

interface NavRightSectionProps {
  isLoggedIn: boolean;
}

export function NavRightSection({ isLoggedIn }: NavRightSectionProps) {
  return (
    <div className="flex items-center justify-end gap-3">
      {isLoggedIn ? (
        <UserMenu />
      ) : (
        <Link href="/login" className="rounded-full bg-ink px-5 py-3 text-sm font-black text-white shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5">
          Sign in
        </Link>
      )}
    </div>
  );
}
