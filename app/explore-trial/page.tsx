'use client';

import dynamic from 'next/dynamic';
import { DragEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { SpaceAnalysis, RecommendationsPanel } from '@/components/space-studio/space-analysis';
import {
  createTrialSpaceDesignProject,
  mapProjectToSceneJson,
  parseSpaceItemsInput,
  SpaceDesignProject,
  trialDesignThemes,
} from '@/features/space-design';
import { SceneObject } from '@/lib/types';

const SceneEditor = dynamic(
  () => import('@/components/scene/scene-editor').then((module) => module.SceneEditor),
  { ssr: false },
);

export default function ExploreTrialPage() {
  const [description, setDescription] = useState('');
  const [itemsText, setItemsText] = useState('');
  const [themeKey, setThemeKey] = useState<(typeof trialDesignThemes)[number]['key']>('orbital-calm');
  const [generatedTrial, setGeneratedTrial] = useState<SpaceDesignProject | null>(null);
  const [selectedObject, setSelectedObject] = useState<SceneObject | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  const selectedTheme = useMemo(
    () => trialDesignThemes.find((theme) => theme.key === themeKey) ?? trialDesignThemes[0],
    [themeKey],
  );
  const imagePreviews = useMemo(
    () => selectedImages.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [selectedImages],
  );
  const sceneJson = useMemo(() => mapProjectToSceneJson(generatedTrial), [generatedTrial]);

  useEffect(
    () => () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    },
    [imagePreviews],
  );

  function generateTrial(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const items = parseSpaceItemsInput(itemsText);
    const nextTrial = createTrialSpaceDesignProject({
      mode: 'trial',
      description: description.trim(),
      items,
      themeKey: selectedTheme.key,
      imageNames: selectedImages.map((image) => image.name),
    });
    setGeneratedTrial(nextTrial);
  }

  function clearTrial() {
    setDescription('');
    setItemsText('');
    setThemeKey('orbital-calm');
    setSelectedImages([]);
    setGeneratedTrial(null);
    setSelectedObject(null);
  }

  function addImages(files: File[]) {
    setSelectedImages((current) =>
      [...current, ...files]
        .filter((file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
        .slice(0, 6),
    );
  }

  function handleImageDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    addImages(Array.from(event.dataTransfer.files));
  }

  function removeImage(index: number) {
    setSelectedImages((files) => files.filter((_, fileIndex) => fileIndex !== index));
  }

  return (
    <section className="min-h-[calc(100vh-165px)] overflow-hidden bg-slate-950 text-white">
      <div className="relative isolate">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_10%,rgba(34,211,238,0.24),transparent_24rem),radial-gradient(circle_at_82%_18%,rgba(168,85,247,0.22),transparent_22rem),radial-gradient(circle_at_50%_90%,rgba(251,191,36,0.15),transparent_26rem)]" />
        <div className="absolute inset-0 -z-10 opacity-30 [background-image:linear-gradient(rgba(148,163,184,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.2)_1px,transparent_1px)] [background-size:72px_72px]" />

        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[420px_1fr]">
          <section className="rounded-[2rem] border border-white/15 bg-white/10 p-6 shadow-2xl shadow-black/20 backdrop-blur">
            <p className="inline-flex rounded-full bg-cyan-300/15 px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-cyan-100">
              Unauthenticated trial
            </p>
            <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">
              Explore an infinite 3D space before you sign up.
            </h1>
            <p className="mt-4 leading-7 text-slate-300">
              Describe the virtual space, list what belongs inside, pick a theme, then generate a design-focused
              spatial preview with analysis and recommendations.
            </p>

            <form onSubmit={generateTrial} className="mt-7 space-y-5">
              <label className="block">
                <span className="text-sm font-bold text-slate-200">Space description</span>
                <textarea
                  required
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="A calm reading lounge with a low sofa, warm lighting, plants, and a small work corner."
                  className="mt-2 min-h-32 w-full rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none ring-cyan-300/40 transition placeholder:text-slate-500 focus:ring-4"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-200">Items present in the space</span>
                <textarea
                  required
                  value={itemsText}
                  onChange={(event) => setItemsText(event.target.value)}
                  placeholder="Curved sofa, coffee table, floor lamp, bookshelf, indoor plant, textured rug"
                  className="mt-2 min-h-28 w-full rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none ring-cyan-300/40 transition placeholder:text-slate-500 focus:ring-4"
                />
                <span className="mt-2 block text-xs text-slate-400">Separate items with commas or new lines.</span>
              </label>

              <fieldset>
                <legend className="text-sm font-bold text-slate-200">Theme selection</legend>
                <div className="mt-3 grid gap-3">
                  {trialDesignThemes.map((theme) => (
                    <button
                      key={theme.key}
                      type="button"
                      onClick={() => setThemeKey(theme.key)}
                      className={`rounded-3xl border p-4 text-left transition hover:-translate-y-0.5 ${
                        theme.key === themeKey
                          ? 'border-cyan-200 bg-cyan-300/15 shadow-lg shadow-cyan-950/30'
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <span className="font-black">{theme.name}</span>
                      <span className="mt-1 block text-sm text-slate-300">{theme.description}</span>
                    </button>
                  ))}
                </div>
              </fieldset>

              <section>
                <h2 className="text-sm font-bold text-slate-200">Space images</h2>
                <div
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={handleImageDrop}
                  className="mt-2 rounded-3xl border border-dashed border-white/15 bg-slate-950/50 p-4 text-center text-sm text-slate-300"
                >
                  <p className="font-bold text-white">Drop up to 6 images</p>
                  <p className="mt-1">Room layouts, furniture arrangements, style references, or inspiration.</p>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={(event) => addImages(Array.from(event.target.files ?? []))}
                    className="mt-3 w-full rounded-xl border border-white/10 bg-slate-950/70 p-2"
                  />
                </div>
                {imagePreviews.length ? (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {imagePreviews.map((preview, index) => (
                      <button
                        key={`${preview.file.name}-${index}`}
                        type="button"
                        onClick={() => removeImage(index)}
                        className="group relative overflow-hidden rounded-xl border border-white/10"
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
              </section>

              <div className="grid gap-3 sm:grid-cols-2">
                <button type="submit" className="rounded-full bg-cyan-200 px-6 py-4 font-black text-slate-950 shadow-xl shadow-cyan-950/30 transition hover:-translate-y-0.5">
                  Generate 3D View
                </button>
                <button type="button" onClick={clearTrial} className="rounded-full border border-white/15 bg-white/10 px-6 py-4 font-black text-white transition hover:-translate-y-0.5 hover:bg-white/15">
                  Clear
                </button>
              </div>
            </form>
          </section>

          <section className="space-y-6">
            <SceneEditor
              scene={sceneJson}
              selectedObjectId={selectedObject?.id ?? null}
              onSelectObject={setSelectedObject}
            />

            {generatedTrial ? (
              <>
                <SpaceAnalysis
                  good={generatedTrial.evaluation?.good.map((item) => item.detail) ?? []}
                  needsImprovement={generatedTrial.evaluation?.needsImprovement.map((item) => item.detail) ?? []}
                />
                <RecommendationsPanel
                  themeName={generatedTrial.space.theme?.name}
                  recommendations={generatedTrial.recommendations}
                />
              </>
            ) : (
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 text-slate-300 backdrop-blur">
                Generated analysis and recommendations will appear here after the 3D view is created.
              </div>
            )}
          </section>
        </div>
      </div>
    </section>
  );
}
