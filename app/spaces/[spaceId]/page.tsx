'use client';

import dynamic from 'next/dynamic';
import { FormEvent, useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { Recommendation, SceneObject, SceneVersion, Space, ThemeDefinition } from '@/lib/types';

const SceneEditor = dynamic(
  () => import('@/components/scene/scene-editor').then((module) => module.SceneEditor),
  { ssr: false },
);

interface PageProps {
  params: Promise<{ spaceId: string }>;
}

export default function SpaceDetailPage({ params }: PageProps) {
  const [spaceId, setSpaceId] = useState<string | null>(null);
  const [space, setSpace] = useState<Space | null>(null);
  const [sceneVersion, setSceneVersion] = useState<SceneVersion | null>(null);
  const [themes, setThemes] = useState<ThemeDefinition[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [selectedObject, setSelectedObject] = useState<SceneObject | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void params.then(({ spaceId: resolvedSpaceId }) => setSpaceId(resolvedSpaceId));
  }, [params]);

  useEffect(() => {
    if (!spaceId) return;
    void Promise.all([
      apiRequest<Space>(`/spaces/${spaceId}`).then(setSpace),
      apiRequest<ThemeDefinition[]>('/themes').then(setThemes),
      apiRequest<SceneVersion>(`/spaces/${spaceId}/scene`).then(setSceneVersion).catch(() => null),
      apiRequest<Recommendation[]>(`/spaces/${spaceId}/recommendations`).then(setRecommendations).catch(() => []),
    ]);
  }, [spaceId]);

  async function addFurniture(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!spaceId) return;
    const form = new FormData(event.currentTarget);
    await apiRequest(`/spaces/${spaceId}/furniture-inputs`, {
      method: 'POST',
      body: JSON.stringify({
        label: String(form.get('label')),
        tags: String(form.get('tags') ?? '')
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      }),
    });
    event.currentTarget.reset();
    setMessage('Furniture input saved');
  }

  async function createUploadUrl(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!spaceId) return;
    const form = new FormData(event.currentTarget);
    const fileName = String(form.get('fileName') || 'room-image.jpg');
    const upload = await apiRequest<{ storageKey: string; uploadUrl: string }>(
      `/spaces/${spaceId}/assets/upload-url?fileName=${encodeURIComponent(fileName)}`,
      { method: 'POST' },
    );
    await apiRequest(`/spaces/${spaceId}/assets/complete`, {
      method: 'POST',
      body: JSON.stringify({
        assetType: 'room-image',
        storageKey: upload.storageKey,
        url: upload.uploadUrl,
        metadata: { fileName },
      }),
    });
    setMessage('Image asset registered. Upload the binary to object storage in production.');
  }

  async function processSpace() {
    if (!spaceId) return;
    const result = await apiRequest<{ sceneVersion: SceneVersion }>(`/spaces/${spaceId}/process`, {
      method: 'POST',
    });
    setSceneVersion(result.sceneVersion);
    const nextRecommendations = await apiRequest<Recommendation[]>(`/spaces/${spaceId}/recommendations`);
    setRecommendations(nextRecommendations);
    setMessage('AI scene generated');
  }

  async function applyTheme(themeKey: string) {
    if (!spaceId) return;
    const nextScene = await apiRequest<SceneVersion>(`/spaces/${spaceId}/apply-theme`, {
      method: 'POST',
      body: JSON.stringify({ themeKey }),
    });
    setSceneVersion(nextScene);
    setMessage(`Applied ${themeKey} theme`);
  }

  async function markRecommendation(id: string, action: 'accept' | 'reject') {
    await apiRequest(`/recommendations/${id}/${action}`, { method: 'POST' });
    setRecommendations((items) =>
      items.map((item) => (item.id === id ? { ...item, status: action === 'accept' ? 'accepted' : 'rejected' } : item)),
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <header className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Space Studio</p>
          <h1 className="mt-2 text-4xl font-bold">{space?.name ?? 'Loading space'}</h1>
        </div>
        <button onClick={processSpace} className="rounded-xl bg-ink px-5 py-3 font-semibold text-white">
          Generate AI scene
        </button>
      </header>

      {message ? <p className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p> : null}

      <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <aside className="space-y-4">
          <form onSubmit={createUploadUrl} className="rounded-3xl bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-bold">Room images</h2>
            <input name="fileName" placeholder="living-room.jpg" className="mb-3 w-full rounded-xl border p-3" />
            <button className="w-full rounded-xl border px-4 py-3 font-semibold">Register image</button>
          </form>

          <form onSubmit={addFurniture} className="rounded-3xl bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-bold">Furniture/items</h2>
            <input name="label" required placeholder="Grey sofa" className="mb-3 w-full rounded-xl border p-3" />
            <input name="tags" placeholder="sofa,fabric,large" className="mb-3 w-full rounded-xl border p-3" />
            <button className="w-full rounded-xl border px-4 py-3 font-semibold">Add item</button>
          </form>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-bold">Themes</h2>
            <div className="grid gap-2">
              {themes.map((theme) => (
                <button
                  key={theme.key}
                  onClick={() => void applyTheme(theme.key)}
                  className="rounded-xl border p-3 text-left font-semibold"
                >
                  {theme.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className="space-y-5">
          <SceneEditor
            scene={sceneVersion?.sceneJson ?? null}
            selectedObjectId={selectedObject?.id ?? null}
            onSelectObject={setSelectedObject}
          />
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-bold">Recommendations</h2>
            <div className="grid gap-3">
              {recommendations.map((recommendation) => (
                <article key={recommendation.id} className="rounded-2xl border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{recommendation.instruction}</p>
                      <p className="mt-1 text-sm text-slate-600">{recommendation.reasoning}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">
                      {recommendation.impact}
                    </span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => void markRecommendation(recommendation.id, 'accept')} className="rounded-lg bg-ink px-3 py-2 text-sm font-semibold text-white">
                      Accept
                    </button>
                    <button onClick={() => void markRecommendation(recommendation.id, 'reject')} className="rounded-lg border px-3 py-2 text-sm font-semibold">
                      Reject
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
