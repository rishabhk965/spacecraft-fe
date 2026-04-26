'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getAccessToken } from '@/lib/api';
import { NavLeftSection } from './nav-left-section';
import { NavRightSection } from './nav-right-section';
import { SpaceCraftLogo } from './spacecraft-logo';

export function AppHeader() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    function syncAuthState() {
      setIsLoggedIn(Boolean(getAccessToken()));
    }

    syncAuthState();
    window.addEventListener('spacecraft-auth-change', syncAuthState);
    window.addEventListener('storage', syncAuthState);

    return () => {
      window.removeEventListener('spacecraft-auth-change', syncAuthState);
      window.removeEventListener('storage', syncAuthState);
    };
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-white/50 bg-white/75 shadow-sm shadow-slate-900/5 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto] items-center gap-4 px-6 py-4 lg:grid-cols-[auto_1fr_auto]">
        <SpaceCraftLogo />
        <NavLeftSection pathname={pathname} />
        <NavRightSection isLoggedIn={isLoggedIn} />
      </div>
    </header>
  );
}
