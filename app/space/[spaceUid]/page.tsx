'use client';

import dynamic from 'next/dynamic';
import { DragEvent, useEffect, useMemo, useState } from 'react';
import { ProtectedPage } from '@/components/protected-page';
import { SpaceCanvas } from '@/components/scene/space-canvas';
import { DesignInsightPanel } from '@/components/space-studio/design-insight-panel';
import { ItemTagInput } from '@/components/space-studio/item-tag-input';
import { RecommendationsPanel, SpaceAnalysis } from '@/components/space-studio/space-analysis';
import { ThemePicker } from '@/components/theme-picker/theme-picker';
import { buildSceneAnalysis } from '@/features/space-design';
import { apiRequest, uploadSpaceImages } from '@/lib/api';
import { AiDesignInsight, Recommendation, SceneObject, SceneVersion, Space, SpaceItem, ThemeDefinition } from '@/lib/types';

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
  const [spaceItems, setSpaceItems] = useState<SpaceItem[]>([]);
  const [designInsight, setDesignInsight] = useState<AiDesignInsight | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [selectedObject, setSelectedObject] = useState<SceneObject | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [uploadedImageIds, setUploadedImageIds] = useState<string[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isGeneratingDesign, setIsGeneratingDesign] = useState(false);

  const imagePreviews = useMemo(
    () => selectedImages.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [selectedImages],
  );
  const activeTheme = useMemo(
    () => space?.theme ?? themes.find((theme) => theme.id === space?.themeId) ?? themes.find((theme) => theme.key === space?.activeThemeKey),
    [space?.activeThemeKey, space?.theme, space?.themeId, themes],
  );
  const analysis = useMemo(
    () => buildSceneAnalysis(sceneVersion?.sceneJson ?? null, space?.description ?? space?.name ?? '', activeTheme?.name),
    [activeTheme?.name, sceneVersion?.sceneJson, space?.description, space?.name],
  );

  useEffect(() => {
    if (!spaceUid) return;
    void Promise.all([
      apiRequest<Space>(`/spaces/${spaceUid}`).then((nextSpace) => {
        setSpace(nextSpace);
        setSpaceItems(nextSpace.items ?? []);
      }),
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

  async function processSpace() {
    const imageIds = uploadedImageIds.length > 0 ? uploadedImageIds : await uploadPendingImages();
    const result = await apiRequest<{ sceneVersion: SceneVersion }>(`/spaces/${spaceUid}/generate`, {
      method: 'POST',
      body: JSON.stringify({
        description: space?.description ?? '',
        items: spaceItems.map((item) => item.name),
        themeId: space?.themeId,
        imageIds,
      }),
    });
    setSceneVersion(result.sceneVersion);
    setRecommendations(await apiRequest<Recommendation[]>(`/spaces/${spaceUid}/recommendations`));
    setMessage('AI scene generated');
  }

  async function saveSpaceItems(nextItems: SpaceItem[]) {
    const updatedSpace = await apiRequest<Space>(`/spaces/${spaceUid}/items`, {
      method: 'PATCH',
      body: JSON.stringify({ items: nextItems }),
    });
    setSpace(updatedSpace);
    setSpaceItems(updatedSpace.items ?? []);
    setMessage('Items saved');
  }

  function persistCanvasItems(nextItems: SpaceItem[]) {
    setSpaceItems(nextItems);
    void saveSpaceItems(nextItems);
  }

  async function generateDesignInsight() {
    setIsGeneratingDesign(true);
    try {
      const imageIds = uploadedImageIds.length > 0 ? uploadedImageIds : await uploadPendingImages();
      const insight = await apiRequest<AiDesignInsight>(`/spaces/${spaceUid}/ai-design`, {
        method: 'POST',
        body: JSON.stringify({
          currentItems: spaceItems,
          roomPhotos: imageIds,
        }),
      });
      setDesignInsight(insight);
      setSpaceItems(applyInsightLayout(spaceItems, insight));
      setMessage('AI layout calculated');
    } finally {
      setIsGeneratingDesign(false);
    }
  }

  async function applyAiSuggestions() {
    if (!designInsight) return;
    const nextItems = applyInsightLayout(mergeRecommendedItems(spaceItems, designInsight), designInsight);
    await saveSpaceItems(nextItems);
    setMessage('AI suggestions applied');
  }

  async function applyTheme(themeId: string) {
    const selectedTheme = themes.find((theme) => theme.id === themeId);
    const nextScene = await apiRequest<SceneVersion>(`/spaces/${spaceUid}/apply-theme`, {
      method: 'POST',
      body: JSON.stringify({ themeId }),
    });
    setSceneVersion(nextScene);
    if (selectedTheme) {
      setSpace((current) =>
        current
          ? { ...current, themeId: selectedTheme.id, theme: selectedTheme, activeThemeKey: selectedTheme.key }
          : current,
      );
    }
    setMessage(`Applied ${selectedTheme?.name ?? 'selected'} theme`);
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

              <ItemTagInput items={spaceItems} onSave={saveSpaceItems} />

              <DesignInsightPanel
                insight={designInsight}
                isLoading={isGeneratingDesign}
                onGenerate={generateDesignInsight}
                onApply={applyAiSuggestions}
              />

              <div className="rounded-3xl bg-white/85 p-5 shadow-sm backdrop-blur">
                <h2 className="mb-3 font-bold">Themes</h2>
                <ThemePicker
                  themes={themes}
                  selectedThemeId={activeTheme?.id ?? null}
                  onSelectTheme={(themeId) => void applyTheme(themeId)}
                  dense
                />
              </div>
            </aside>

            <section className="space-y-5">
              <SpaceCanvas items={spaceItems} theme={activeTheme} onItemsChange={persistCanvasItems} />
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

function applyInsightLayout(items: SpaceItem[], insight: AiDesignInsight): SpaceItem[] {
  const layoutByName = new Map(insight.layout.map((layout) => [normalizeName(layout.name), layout]));

  return items.map((item) => {
    const layout = layoutByName.get(normalizeName(item.name));
    if (!layout) return item;
    return {
      ...item,
      position: layout.coords,
      rotation: layout.rotation,
      shapeType: layout.shapeType,
      dimensions: layout.dimensions,
      material: layout.material,
      mass: layout.mass,
      isDraggable: layout.isDraggable,
      collision: layout.collision,
    };
  });
}

function mergeRecommendedItems(items: SpaceItem[], insight: AiDesignInsight): SpaceItem[] {
  const existingNames = new Set(items.map((item) => normalizeName(item.name)));
  const layoutByName = new Map(insight.layout.map((layout) => [normalizeName(layout.name), layout]));
  const additions = insight.recommendations
    .filter((recommendation) => !existingNames.has(normalizeName(recommendation.name)))
    .map((recommendation): SpaceItem => {
      const layout = layoutByName.get(normalizeName(recommendation.name));
      return {
        name: recommendation.name,
        position: layout?.coords ?? [0, 0.35, 0],
        rotation: layout?.rotation ?? [0, 0, 0],
        shapeType: layout?.shapeType,
        dimensions: layout?.dimensions,
        material: layout?.material,
        mass: layout?.mass,
        isDraggable: layout?.isDraggable,
        collision: layout?.collision,
      };
    });

  return [...items, ...additions];
}

function normalizeName(value: string): string {
  return value.trim().toLowerCase();
}
