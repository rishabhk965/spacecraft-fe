import {
  CreateSpaceDesignProjectInput,
  DesignTheme,
  EvaluationTone,
  MaterialDefinition,
  SceneObject3D,
  SpaceDesignProject,
  SpaceEvaluation,
  SpaceItem,
  SpaceRecommendation,
  Transform3D,
} from './space-design.types';

export const trialDesignThemes = [
  {
    key: 'orbital-calm',
    name: 'Orbital Calm',
    description: 'Soft neutrals, airy spacing, and gentle cyan highlights.',
    palette: {
      primary: '#67e8f9',
      secondary: '#c4b5fd',
      accent: '#fef3c7',
      wall: '#bfdbfe',
      floor: '#e0f2fe',
      swatches: ['#67e8f9', '#c4b5fd', '#fef3c7', '#bfdbfe', '#e0f2fe'],
    },
  },
  {
    key: 'lunar-minimal',
    name: 'Lunar Minimal',
    description: 'Quiet monochrome, clean silhouettes, and deliberate negative space.',
    palette: {
      primary: '#e2e8f0',
      secondary: '#94a3b8',
      accent: '#cbd5e1',
      wall: '#f8fafc',
      floor: '#a5b4fc',
      swatches: ['#e2e8f0', '#94a3b8', '#cbd5e1', '#f8fafc', '#a5b4fc'],
    },
  },
  {
    key: 'nebula-pop',
    name: 'Nebula Pop',
    description: 'Bold accent zones, playful contrast, and energetic focal points.',
    palette: {
      primary: '#f472b6',
      secondary: '#fb923c',
      accent: '#22d3ee',
      wall: '#a78bfa',
      floor: '#facc15',
      swatches: ['#f472b6', '#fb923c', '#22d3ee', '#a78bfa', '#facc15'],
    },
  },
  {
    key: 'biophilic-station',
    name: 'Biophilic Station',
    description: 'Organic greens, warm light, and cozy planetarium textures.',
    palette: {
      primary: '#86efac',
      secondary: '#fde68a',
      accent: '#7dd3fc',
      wall: '#fca5a5',
      floor: '#d9f99d',
      swatches: ['#86efac', '#fde68a', '#7dd3fc', '#fca5a5', '#d9f99d'],
    },
  },
] as const satisfies readonly DesignTheme[];

export function parseSpaceItemsInput(value: string): string[] {
  return value
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 10);
}

export function getTrialDesignTheme(themeKey: string): DesignTheme {
  return trialDesignThemes.find((theme) => theme.key === themeKey) ?? trialDesignThemes[0];
}

export function createTrialSpaceDesignProject(input: CreateSpaceDesignProjectInput): SpaceDesignProject {
  const now = new Date().toISOString();
  const description = input.description.trim() || 'An exploratory virtual space';
  const theme = getTrialDesignTheme(input.themeKey);
  const mergedItemLabels = [...new Set([...input.items, ...inferItemsFromImageNames(input.imageNames ?? [])])];
  const items = mergedItemLabels.map((item, index) => createTrialItem(item, index, theme));
  const objects = items.map((item) => createSceneObject(item, theme));

  return {
    id: `trial-${slugify(description).slice(0, 24) || 'space'}`,
    mode: input.mode,
    space: {
      id: 'trial-space',
      name: 'Explore Trial Space',
      description,
      dimensions: { width: 12, depth: 12, height: 4 },
      constraints: [
        {
          id: 'trial-clear-path',
          type: 'walkway',
          description: 'Keep at least one clear path through the center of the generated layout.',
          severity: 'warning',
        },
      ],
      theme,
    },
    items,
    scene: {
      versionId: 'trial-scene-v1',
      versionNumber: 1,
      renderer: 'three',
      room: {
        width: 12,
        depth: 12,
        height: 4,
        wallColor: theme.palette.wall,
        floorMaterial: theme.palette.floor,
        layoutConfidence: 0.78,
      },
      objects,
    },
    evaluation: buildTrialEvaluation(items, description, theme),
    recommendations: buildTrialRecommendations(items, description, theme),
    metadata: {
      createdAt: now,
      updatedAt: now,
      source: input.imageNames?.length ? 'vision' : 'user',
    },
  };
}

function createTrialItem(label: string, index: number, theme: DesignTheme): SpaceItem {
  const category = categoryForItem(label);
  const transform = transformForIndex(index, category);
  const material: MaterialDefinition = {
    color: theme.palette.swatches[index % theme.palette.swatches.length],
    finish: category === 'seating' ? 'fabric' : 'matte',
  };

  return {
    id: `${index}-${slugify(label)}`,
    label,
    category,
    source: 'user',
    attributes: { tags: [category] },
    transform,
    material,
  };
}

function createSceneObject(item: SpaceItem, theme: DesignTheme): SceneObject3D {
  return {
    id: `object-${item.id}`,
    itemId: item.id,
    label: item.label,
    category: item.category,
    transform: item.transform ?? transformForIndex(0, item.category),
    material:
      item.material ?? {
        color: theme.palette.primary,
        finish: 'matte',
      },
    confidence: 0.82,
  };
}

function transformForIndex(index: number, category: string): Transform3D {
  const angle = index * 0.86;
  const radius = 1.25 + index * 0.33;

  return {
    position: {
      x: Number((Math.cos(angle) * radius).toFixed(2)),
      y: 0.38,
      z: Number((Math.sin(angle) * radius).toFixed(2)),
    },
    rotation: { x: 0, y: Number((angle / 5).toFixed(2)), z: 0 },
    scale: scaleForCategory(category),
  };
}

function buildTrialEvaluation(items: SpaceItem[], description: string, theme: DesignTheme): SpaceEvaluation {
  return {
    summary: `${theme.name} generated a first-pass spatial read for "${description}".`,
    score: items.length >= 4 ? 76 : 64,
    good: [
      createEvaluation(
        'good-theme-coherence',
        'good',
        'Theme coherence',
        `${theme.name} gives the scene a coherent palette, so the space reads as one intentional concept instead of disconnected objects.`,
        items.slice(0, 3).map((item) => item.id),
      ),
      createEvaluation(
        'good-clear-zone',
        'good',
        'Clear central zone',
        'The orbit-style spacing leaves usable pathways between major items and keeps the environment feeling open.',
        items.map((item) => item.id),
      ),
    ],
    needsImprovement: buildNeedsImprovement(items, description),
  };
}

function buildNeedsImprovement(items: SpaceItem[], description: string) {
  const hasLighting = items.some((item) => /lamp|light|sconce|chandelier/i.test(item.label));
  const hasStorage = items.some((item) => /shelf|cabinet|wardrobe|closet|storage/i.test(item.label));
  const hasAnchor = items.some((item) => /sofa|table|desk|bed|rug/i.test(item.label));

  return [
    createEvaluation(
      'improve-lighting',
      'needs-improvement',
      hasLighting ? 'Lighting proximity' : 'Missing lighting',
      hasLighting
        ? 'Lighting exists, but it should be moved closer to the primary activity area so the focal zone feels intentional.'
        : 'Add a lighting element so the generated layout has clearer mood, depth, and visual hierarchy.',
      items.filter((item) => /lamp|light|sconce|chandelier/i.test(item.label)).map((item) => item.id),
    ),
    createEvaluation(
      'improve-storage',
      'needs-improvement',
      hasStorage ? 'Storage placement' : 'Missing storage context',
      hasStorage
        ? 'Storage is present, but it should be pushed toward the edge of the layout to reduce clutter in the center.'
        : 'Consider adding storage or shelving to give loose items a clear context and reduce visual noise.',
      items.filter((item) => /shelf|cabinet|wardrobe|closet|storage/i.test(item.label)).map((item) => item.id),
    ),
    createEvaluation(
      'improve-anchor',
      'needs-improvement',
      hasAnchor ? 'Stronger focal anchor' : 'Missing anchor piece',
      hasAnchor
        ? `The space captures the brief, but "${description}" would benefit from clearer adjacency between related items.`
        : 'The current object set needs a stronger anchor piece, such as a rug, table, sofa, or workstation, to organize the rest of the scene.',
      items.filter((item) => /sofa|table|desk|bed|rug/i.test(item.label)).map((item) => item.id),
    ),
  ];
}

function buildTrialRecommendations(items: SpaceItem[], description: string, theme: DesignTheme): SpaceRecommendation[] {
  const itemCount = items.length;
  const firstItem = items[0];

  return [
    {
      id: 'rec-activity-cluster',
      title: 'Create one main activity cluster',
      reasoning: `Create one main activity cluster for "${description}" and place secondary objects in a loose orbit around it.`,
      impact: 'high',
      status: 'pending',
      action: firstItem
        ? { type: 'move-item', itemId: firstItem.id, transform: transformForIndex(0, firstItem.category) }
        : { type: 'change-theme', themeKey: theme.key },
    },
    {
      id: 'rec-palette-hierarchy',
      title: 'Use palette as hierarchy',
      reasoning: `Use the ${theme.name} palette as a hierarchy system: strongest color on the focal item, softer colors on support items.`,
      impact: 'medium',
      status: 'pending',
      action: { type: 'change-theme', themeKey: theme.key },
    },
    {
      id: 'rec-context-piece',
      title: itemCount > 6 ? 'Group small objects into curated zones' : 'Add a contextual support piece',
      reasoning:
        itemCount > 6
          ? 'Group small decorative objects into two or three curated zones so the space feels designed instead of scattered.'
          : 'Add one contextual support piece, such as a side table, plant, lamp, or rug, to make the generated scene feel more complete.',
      impact: 'medium',
      status: 'pending',
      action: {
        type: 'add-item',
        item: createTrialItem('Context support piece', items.length, theme),
      },
    },
  ];
}

function createEvaluation(
  id: string,
  tone: EvaluationTone,
  title: string,
  detail: string,
  itemIds: string[],
) {
  return { id, tone, title, detail, itemIds };
}

function categoryForItem(item: string): string {
  const text = item.toLowerCase();
  if (/(sofa|chair|bench|seat|bed)/.test(text)) return 'seating';
  if (/(table|desk|counter|island)/.test(text)) return 'surface';
  if (/(shelf|cabinet|wardrobe|closet|storage)/.test(text)) return 'storage';
  if (/(lamp|light|sconce|chandelier)/.test(text)) return 'lighting';
  if (/(plant|art|rug|mirror|decor|vase)/.test(text)) return 'decor';
  return 'object';
}

function scaleForCategory(category: string): Transform3D['scale'] {
  if (category === 'seating') return { x: 1.05, y: 0.9, z: 1 };
  if (category === 'surface') return { x: 0.95, y: 1, z: 0.95 };
  if (category === 'storage') return { x: 0.9, y: 1.15, z: 0.9 };
  if (category === 'lighting') return { x: 0.82, y: 1, z: 0.82 };
  if (category === 'decor') return { x: 0.86, y: 0.86, z: 0.86 };
  return { x: 1, y: 1, z: 1 };
}

function inferItemsFromImageNames(imageNames: string[]): string[] {
  const text = imageNames.join(' ').toLowerCase();
  const items = new Set<string>();
  if (/office|study|desk|work/.test(text)) {
    items.add('desk');
    items.add('office chair');
    items.add('lamp');
  }
  if (/bed|bedroom/.test(text)) items.add('bed');
  if (/living|sofa|lounge/.test(text)) {
    items.add('sofa');
    items.add('coffee table');
  }
  if (/kitchen|counter|stove|sink/.test(text)) {
    items.add('kitchen counter');
    items.add('sink');
    items.add('stove');
  }
  if (/plant|decor|style|inspiration/.test(text)) items.add('plant');
  return [...items];
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
