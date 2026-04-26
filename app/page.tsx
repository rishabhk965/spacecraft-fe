'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getAccessToken } from '@/lib/api';

export default function HomePage() {
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
  }, []);

  return (
    <section className="space-doodle-bg min-h-[calc(100vh-165px)] overflow-hidden text-ink">
      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-165px)] max-w-7xl items-center gap-10 px-6 pb-20 pt-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="mb-5 inline-flex rounded-full border border-indigo-200 bg-white/70 px-4 py-2 text-sm font-bold uppercase tracking-[0.25em] text-indigo-700 shadow-sm backdrop-blur">
            Doodle your dream orbit
          </p>
          <h1 className="max-w-4xl text-5xl font-black tracking-tight text-ink sm:text-6xl lg:text-7xl">
            Turn room photos into playful, editable space plans.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
            Upload room images, describe your furniture, pick a theme, and explore an AI-assisted
            3D redesign that feels like sketching your home among stars.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            {isLoggedIn ? (
              <Link className="rounded-full bg-ink px-7 py-4 text-center font-bold text-white shadow-xl shadow-slate-900/20 transition hover:-translate-y-0.5" href="/spaces">
                Open My Spaces
              </Link>
            ) : (
              <>
                <Link
                  href="/explore-trial"
                  className="rounded-full bg-ink px-7 py-4 text-center font-bold text-white shadow-xl shadow-slate-900/20 transition hover:-translate-y-0.5"
                >
                  Explore Trial
                </Link>
                <Link className="rounded-full border border-ink/15 bg-white/75 px-7 py-4 text-center font-bold shadow-sm backdrop-blur transition hover:-translate-y-0.5" href="/login">
                  Sign In / Sign Up
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="relative min-h-[540px]">
          <div className="absolute left-8 top-8 h-40 w-40 rounded-full border-4 border-dashed border-indigo-300 bg-indigo-100/70 shadow-xl shadow-indigo-900/10" />
          <div className="absolute right-10 top-20 h-28 w-28 rounded-full border-4 border-slate-900 bg-amber-200 shadow-xl shadow-amber-900/10">
            <span className="absolute left-[-32px] top-12 h-3 w-44 -rotate-12 rounded-full border-2 border-slate-900 bg-white/60" />
          </div>
          <div className="absolute bottom-14 left-10 w-80 rotate-[-4deg] rounded-[2rem] border-4 border-slate-900 bg-white/85 p-5 shadow-2xl shadow-slate-900/15 backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Room Map</span>
              <span className="text-2xl">+</span>
            </div>
            <div className="grid h-44 grid-cols-3 gap-3 rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 p-3">
              <div className="rounded-2xl bg-indigo-200" />
              <div className="col-span-2 rounded-2xl bg-amber-200" />
              <div className="col-span-2 rounded-2xl bg-rose-200" />
              <div className="rounded-2xl bg-cyan-200" />
            </div>
          </div>
          <div className="absolute bottom-0 right-4 rounded-[2rem] border-4 border-slate-900 bg-cyan-100 px-6 py-5 shadow-2xl shadow-cyan-900/10">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-800">AI Notes</p>
            <p className="mt-2 max-w-48 text-sm font-semibold text-slate-700">More light near the reading corner. Try lunar minimal.</p>
          </div>
          <div className="rocket-doodle absolute right-40 top-56 h-28 w-16 rotate-12 rounded-t-full border-4 border-slate-900 bg-white shadow-xl shadow-slate-900/10">
            <span className="absolute left-4 top-7 h-8 w-8 rounded-full border-4 border-slate-900 bg-cyan-200" />
            <span className="absolute -bottom-8 left-4 h-9 w-8 rounded-b-full bg-orange-300" />
          </div>
        </div>
      </div>
    </section>
  );
}
