'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { ProtectedPage } from '@/components/protected-page';
import { ThemePicker } from '@/components/theme-picker/theme-picker';
import { apiRequest } from '@/lib/api';
import { Space, ThemeDefinition } from '@/lib/types';

export default function SpacesPage() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [themes, setThemes] = useState<ThemeDefinition[]>([]);
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadSpaces() {
    setSpaces(await apiRequest<Space[]>('/spaces'));
  }

  useEffect(() => {
    async function loadInitialData() {
      const [nextSpaces, nextThemes] = await Promise.all([
        apiRequest<Space[]>('/spaces'),
        apiRequest<ThemeDefinition[]>('/themes'),
      ]);
      setSpaces(nextSpaces);
      setThemes(nextThemes);
      setSelectedThemeId((current) => current ?? nextThemes[0]?.id ?? null);
    }

    void loadInitialData().catch((err: unknown) =>
      setError(err instanceof Error ? err.message : 'Unable to load spaces'),
    );
  }, []);

  async function createSpace(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedThemeId) {
      setError('Select a theme before creating a space.');
      return;
    }
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    await apiRequest<Space>('/spaces', {
      method: 'POST',
      body: JSON.stringify({
        name: String(form.get('name')),
        description: String(form.get('description') ?? ''),
        themeId: selectedThemeId,
      }),
    });
    formElement.reset();
    await loadSpaces();
  }

  return (
    <ProtectedPage>
      <section className="space-doodle-bg min-h-[calc(100vh-165px)] text-ink">
        <div className="relative z-10 mx-auto max-w-6xl px-6 py-10">
          <header className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Dashboard</p>
            <h1 className="mt-2 text-4xl font-black">Your spaces</h1>
          </header>

          <form onSubmit={createSpace} className="mb-8 grid gap-5 rounded-3xl bg-white/85 p-5 shadow-sm backdrop-blur">
            <div className="grid gap-3 md:grid-cols-[1fr_2fr_auto]">
              <input name="name" required placeholder="Space name" className="rounded-xl border p-3" />
              <input name="description" placeholder="Short description" className="rounded-xl border p-3" />
              <button disabled={!selectedThemeId} className="rounded-xl bg-ink px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
                Create
              </button>
            </div>
            {themes.length > 0 ? (
              <ThemePicker
                themes={themes}
                selectedThemeId={selectedThemeId}
                onSelectTheme={setSelectedThemeId}
                showPreview
              />
            ) : null}
          </form>

          {error ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
          <section className="grid gap-4 md:grid-cols-3">
            {spaces.map((space) => (
              <Link key={space.id} href={`/space/${space.id}`} className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur transition hover:-translate-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  {space.theme?.name ?? space.activeThemeKey ?? 'No theme'}
                </p>
                <h2 className="mt-3 text-xl font-bold">{space.name}</h2>
                <p className="mt-2 text-sm text-slate-600">{space.description}</p>
                {space.theme ? (
                  <div className="mt-4 flex gap-2">
                    {space.theme.designSpecs.colorPalette.map((color) => (
                      <span key={color} className="h-5 w-5 rounded-full border border-slate-200" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                ) : null}
              </Link>
            ))}
          </section>
        </div>
      </section>
    </ProtectedPage>
  );
}
