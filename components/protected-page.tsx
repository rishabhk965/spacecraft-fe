'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/api';

interface ProtectedPageProps {
  children: ReactNode;
}

export function ProtectedPage({ children }: ProtectedPageProps) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    function syncAuthState() {
      if (!isAuthenticated()) {
        setAllowed(false);
        router.replace('/login');
        return;
      }
      setAllowed(true);
    }

    syncAuthState();
    window.addEventListener('spacecraft-auth-change', syncAuthState);
    window.addEventListener('storage', syncAuthState);

    return () => {
      window.removeEventListener('spacecraft-auth-change', syncAuthState);
      window.removeEventListener('storage', syncAuthState);
    };
  }, [router]);

  if (!allowed) {
    return (
      <div className="grid min-h-[calc(100vh-165px)] place-items-center bg-slate-950 px-6 text-white">
        <p className="rounded-3xl border border-white/10 bg-white/10 px-5 py-4 text-sm font-semibold backdrop-blur">
          Checking your SpaceCraft session...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
