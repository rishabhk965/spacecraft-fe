import { SceneJson } from '@/lib/types';
import { SpaceDesignProject } from './space-design.types';

export function mapProjectToSceneJson(project: SpaceDesignProject | null): SceneJson | null {
  if (!project?.scene) return null;

  return {
    room: project.scene.room,
    objects: project.scene.objects.map((object) => ({
      id: object.id,
      category: object.category,
      label: object.label,
      position: object.transform.position,
      rotation: object.transform.rotation,
      scale: object.transform.scale,
      material: {
        color: object.material.color,
        finish: object.material.finish,
      },
      confidence: object.confidence,
    })),
  };
}

export function buildSceneAnalysis(scene: SceneJson | null, description: string, themeName?: string) {
  if (!scene) {
    return { good: [], needsImprovement: [] };
  }

  const labels = scene.objects.map((object) => object.label);
  const hasLighting = labels.some((label) => /lamp|light|sconce|chandelier/i.test(label));
  const hasStorage = labels.some((label) => /shelf|cabinet|wardrobe|closet|storage/i.test(label));
  const hasAnchor = labels.some((label) => /sofa|table|desk|bed|rug/i.test(label));
  const readableTheme = themeName ?? 'The selected theme';

  return {
    good: [
      `${readableTheme} gives the generated scene a coherent palette, so the space reads as one intentional concept.`,
      `${scene.objects.length} object${scene.objects.length === 1 ? '' : 's'} are represented in the same 3D coordinate system, which keeps trial and saved-space previews consistent.`,
      'The infinite canvas keeps the model exploratory while still anchoring objects to a central layout zone.',
    ],
    needsImprovement: [
      hasLighting
        ? 'Lighting exists, but it should be moved closer to the main activity area so the focal zone feels intentional.'
        : 'Add a lighting element so the generated layout has clearer mood, depth, and visual hierarchy.',
      hasStorage
        ? 'Storage is present, but it should be pushed toward the edge of the layout to reduce clutter in the center.'
        : 'Consider adding storage or shelving to give loose items a clear context and reduce visual noise.',
      hasAnchor
        ? `The space captures "${description}", but related objects should be grouped more tightly around the focal anchor.`
        : 'Add a stronger anchor piece, such as a rug, table, sofa, or workstation, to organize the rest of the scene.',
    ],
  };
}
