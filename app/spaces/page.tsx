'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { Space } from '@/lib/types';

export default function SpacesPage() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function loadSpaces() {
    setSpaces(await apiRequest<Space[]>('/spaces'));
  }

  useEffect(() => {
    void loadSpaces().catch((err: unknown) =>
      setError(err instanceof Error ? err.message : 'Unable to load spaces'),
    );
  }, []);

  async function createSpace(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await apiRequest<Space>('/spaces', {
      method: 'POST',
      body: JSON.stringify({
        name: String(form.get('name')),
        description: String(form.get('description') ?? ''),
      }),
    });
    event.currentTarget.reset();
    await loadSpaces();
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Dashboard</p>
        <h1 className="mt-2 text-4xl font-bold">Your spaces</h1>
      </header>

      <form onSubmit={createSpace} className="mb-8 grid gap-3 rounded-3xl bg-white p-5 shadow-sm md:grid-cols-[1fr_2fr_auto]">
        <input name="name" required placeholder="Space name" className="rounded-xl border p-3" />
        <input name="description" placeholder="Short description" className="rounded-xl border p-3" />
        <button className="rounded-xl bg-ink px-5 py-3 font-semibold text-white">Create</button>
      </form>

      {error ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      <section className="grid gap-4 md:grid-cols-3">
        {spaces.map((space) => (
          <Link key={space.id} href={`/spaces/${space.id}`} className="rounded-3xl bg-white p-5 shadow-sm transition hover:-translate-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {space.activeThemeKey ?? 'No theme'}
            </p>
            <h2 className="mt-3 text-xl font-bold">{space.name}</h2>
            <p className="mt-2 text-sm text-slate-600">{space.description}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
