'use client';

import dynamic from 'next/dynamic';
import { DragEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { ProtectedPage } from '@/components/protected-page';
import { RecommendationsPanel, SpaceAnalysis } from '@/components/space-studio/space-analysis';
import { buildSceneAnalysis } from '@/features/space-design';
import { apiRequest, uploadSpaceImages } from '@/lib/api';
import { Recommendation, SceneObject, SceneVersion, Space, ThemeDefinition } from '@/lib/types';

const SceneEditor = dynamic(
  () => import('@/components/scene/scene-editor').then((module) => module.SceneEditor),
  { ssr: false },
);

interface PageProps {
  params: { spaceUid: string };
}

export default function SpaceStudioPage({ params }: PageProps) {
  const spaceUid = params.spaceUid;
  const [space, setSpace] = useState<Space | null>(null);
  const [sceneVersion, setSceneVersion] = useState<SceneVersion | null>(null);
  const [themes, setThemes] = useState<ThemeDefinition[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [selectedObject, setSelectedObject] = useState<SceneObject | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [uploadedImageIds, setUploadedImageIds] = useState<string[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const imagePreviews = useMemo(
    () => selectedImages.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [selectedImages],
  );
  const activeTheme = useMemo(
    () => themes.find((theme) => theme.key === space?.activeThemeKey),
    [space?.activeThemeKey, themes],
  );
  const analysis = useMemo(
    () => buildSceneAnalysis(sceneVersion?.sceneJson ?? null, space?.description ?? space?.name ?? '', activeTheme?.name),
    [activeTheme?.name, sceneVersion?.sceneJson, space?.description, space?.name],
  );

  useEffect(() => {
    if (!spaceUid) return;
    void Promise.all([
      apiRequest<Space>(`/spaces/${spaceUid}`).then(setSpace),
      apiRequest<ThemeDefinition[]>('/themes').then(setThemes),
      apiRequest<SceneVersion>(`/spaces/${spaceUid}/scene`).then(setSceneVersion).catch(() => null),
      apiRequest<Recommendation[]>(`/spaces/${spaceUid}/recommendations`).then(setRecommendations).catch(() => []),
    ]);
  }, [spaceUid]);

  useEffect(
    () => () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    },
    [imagePreviews],
  );

  async function addFurniture(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    await apiRequest(`/spaces/${spaceUid}/furniture-inputs`, {
      method: 'POST',
      body: JSON.stringify({
        label: String(form.get('label')),
        tags: String(form.get('tags') ?? '')
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      }),
    });
    formElement.reset();
    setMessage('Furniture input saved');
  }

  async function processSpace() {
    const imageIds = uploadedImageIds.length > 0 ? uploadedImageIds : await uploadPendingImages();
    const result = await apiRequest<{ sceneVersion: SceneVersion }>(`/spaces/${spaceUid}/generate`, {
      method: 'POST',
      body: JSON.stringify({
        description: space?.description ?? '',
        items: [],
        theme: space?.activeThemeKey ?? '',
        imageIds,
      }),
    });
    setSceneVersion(result.sceneVersion);
    setRecommendations(await apiRequest<Recommendation[]>(`/spaces/${spaceUid}/recommendations`));
    setMessage('AI scene generated');
  }

  async function applyTheme(themeKey: string) {
    const nextScene = await apiRequest<SceneVersion>(`/spaces/${spaceUid}/apply-theme`, {
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

  function addImages(files: File[]) {
    const nextImages = [...selectedImages, ...files]
      .filter((file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
      .slice(0, 6);
    setSelectedImages(nextImages);
    setUploadedImageIds([]);
  }

  function handleImageDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    addImages(Array.from(event.dataTransfer.files));
  }

  function removeImage(index: number) {
    setSelectedImages((files) => files.filter((_, fileIndex) => fileIndex !== index));
    setUploadedImageIds([]);
  }

  async function uploadPendingImages(): Promise<string[]> {
    if (selectedImages.length === 0) return [];
    setIsUploadingImages(true);
    try {
      const result = await uploadSpaceImages(spaceUid, selectedImages);
      setUploadedImageIds(result.imageIds);
      setMessage(`${result.imageIds.length} image${result.imageIds.length === 1 ? '' : 's'} uploaded`);
      return result.imageIds;
    } finally {
      setIsUploadingImages(false);
    }
  }

  return (
    <ProtectedPage>
      <section className="space-doodle-bg min-h-[calc(100vh-165px)] text-ink">
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-10">
          <header className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Space Studio</p>
              <h1 className="mt-2 text-4xl font-black">{space?.name ?? 'Loading space'}</h1>
            </div>
            <button onClick={() => void processSpace()} className="rounded-xl bg-ink px-5 py-3 font-semibold text-white">
              Generate AI scene
            </button>
          </header>

          {message ? <p className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p> : null}

          <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
            <aside className="space-y-4">
              <section className="rounded-3xl bg-white/85 p-5 shadow-sm backdrop-blur">
                <h2 className="mb-3 font-bold">Room images</h2>
                <div
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={handleImageDrop}
                  className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-4 text-center text-sm text-slate-600"
                >
                  <p className="font-semibold text-slate-800">Drop up to 6 images</p>
                  <p className="mt-1">JPG, PNG, or WebP. Images improve placement, scale, and room detection.</p>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={(event) => addImages(Array.from(event.target.files ?? []))}
                    className="mt-3 w-full rounded-xl border p-2"
                  />
                </div>
                {imagePreviews.length ? (
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {imagePreviews.map((preview, index) => (
                      <button
                        key={`${preview.file.name}-${index}`}
                        type="button"
                        onClick={() => removeImage(index)}
                        className="group relative overflow-hidden rounded-xl border"
                        aria-label={`Remove ${preview.file.name}`}
                      >
                        <span
                          className="block h-20 w-full bg-cover bg-center"
                          style={{ backgroundImage: `url(${preview.url})` }}
                        />
                        <span className="absolute inset-x-0 bottom-0 bg-black/60 px-1 py-0.5 text-xs text-white opacity-0 transition group-hover:opacity-100">
                          Remove
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={() => void uploadPendingImages()}
                  disabled={selectedImages.length === 0 || isUploadingImages}
                  className="mt-4 w-full rounded-xl border px-4 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isUploadingImages ? 'Uploading...' : 'Upload images'}
                </button>
              </section>

              <form onSubmit={addFurniture} className="rounded-3xl bg-white/85 p-5 shadow-sm backdrop-blur">
                <h2 className="mb-3 font-bold">Furniture/items</h2>
                <input name="label" required placeholder="Grey sofa" className="mb-3 w-full rounded-xl border p-3" />
                <input name="tags" placeholder="sofa,fabric,large" className="mb-3 w-full rounded-xl border p-3" />
                <button className="w-full rounded-xl border px-4 py-3 font-semibold">Add item</button>
              </form>

              <div className="rounded-3xl bg-white/85 p-5 shadow-sm backdrop-blur">
                <h2 className="mb-3 font-bold">Themes</h2>
                <div className="grid gap-2">
                  {themes.map((theme) => (
                    <button key={theme.key} onClick={() => void applyTheme(theme.key)} className="rounded-xl border p-3 text-left font-semibold">
                      {theme.name}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            <section className="space-y-5">
              <SceneEditor scene={sceneVersion?.sceneJson ?? null} selectedObjectId={selectedObject?.id ?? null} onSelectObject={setSelectedObject} />
              <SpaceAnalysis good={analysis.good} needsImprovement={analysis.needsImprovement} />
              <RecommendationsPanel
                themeName={activeTheme?.name}
                recommendations={recommendations}
                onAction={(id, action) => void markRecommendation(id, action)}
              />
            </section>
          </section>
        </div>
      </section>
    </ProtectedPage>
  );
}
