import { Recommendation, SceneVersion, Space, ThemeDefinition } from '@/lib/types';
import {
  DesignTheme,
  MaterialDefinition,
  SceneObject3D,
  SpaceDesignProject,
  SpaceRecommendation,
} from './space-design.types';

export function mapAuthenticatedSpaceDesignProject({
  space,
  sceneVersion,
  recommendations,
  themes,
}: {
  space: Space;
  sceneVersion: SceneVersion | null;
  recommendations: Recommendation[];
  themes: ThemeDefinition[];
}): SpaceDesignProject {
  const activeTheme = themes.find((theme) => theme.key === space.activeThemeKey);
  const now = new Date().toISOString();

  return {
    id: space.id,
    mode: 'authenticated',
    space: {
      id: space.id,
      name: space.name,
      description: space.description ?? '',
      dimensions: sceneVersion
        ? {
            width: sceneVersion.sceneJson.room.width,
            depth: sceneVersion.sceneJson.room.depth,
            height: sceneVersion.sceneJson.room.height,
          }
        : undefined,
      constraints: [],
      theme: activeTheme ? mapTheme(activeTheme) : null,
    },
    items:
      sceneVersion?.sceneJson.objects.map((object) => ({
        id: object.id,
        label: object.label,
        category: object.category,
        source: 'vision' as const,
        attributes: {},
        transform: {
          position: object.position,
          rotation: object.rotation,
          scale: object.scale,
        },
        material: {
          color: object.material.color,
          finish: normalizeFinish(object.material.finish),
        },
      })) ?? [],
    scene: sceneVersion
      ? {
          versionId: sceneVersion.id,
          versionNumber: sceneVersion.versionNumber,
          renderer: 'three',
          room: sceneVersion.sceneJson.room,
          objects: sceneVersion.sceneJson.objects.map((object): SceneObject3D => ({
            id: `object-${object.id}`,
            itemId: object.id,
            label: object.label,
            category: object.category,
            transform: {
              position: object.position,
              rotation: object.rotation,
              scale: object.scale,
            },
            material: {
              color: object.material.color,
              finish: normalizeFinish(object.material.finish),
            },
            confidence: object.confidence,
          })),
        }
      : null,
    evaluation: null,
    recommendations: recommendations.map(mapRecommendation),
    metadata: {
      createdAt: now,
      updatedAt: now,
      source: 'vision',
    },
  };
}

function mapTheme(theme: ThemeDefinition): DesignTheme {
  return {
    key: theme.key,
    name: theme.name,
    description: theme.name,
    palette: {
      primary: theme.palette.primary,
      secondary: theme.palette.secondary,
      accent: theme.palette.accent,
      wall: theme.palette.wall,
      floor: theme.palette.floor,
      swatches: [
        theme.palette.primary,
        theme.palette.secondary,
        theme.palette.accent,
        theme.palette.wall,
        theme.palette.floor,
      ],
    },
  };
}

function mapRecommendation(recommendation: Recommendation): SpaceRecommendation {
  return {
    id: recommendation.id,
    title: recommendation.instruction,
    reasoning: recommendation.reasoning,
    impact: recommendation.impact,
    status: recommendation.status,
    action: {
      type: 'add-item',
      item: {
        id: `recommendation-${recommendation.id}`,
        label: recommendation.instruction,
        category: 'decor',
        source: 'recommendation',
        attributes: {},
        transform: null,
        material: null,
      },
    },
  };
}

function normalizeFinish(value: string): MaterialDefinition['finish'] {
  if (value === 'matte' || value === 'gloss' || value === 'fabric' || value === 'wood' || value === 'metal') {
    return value;
  }
  return 'unknown';
}
