export type SpaceDesignMode = 'trial' | 'authenticated' | 'template' | 'imported';

export type SpaceDesignSource = 'user' | 'vision' | 'template' | 'theme' | 'recommendation';

export type EvaluationTone = 'good' | 'needs-improvement';

export type RecommendationStatus = 'pending' | 'accepted' | 'rejected';

export type RecommendationImpact = 'low' | 'medium' | 'high';

export interface Vector3Tuple {
  x: number;
  y: number;
  z: number;
}

export interface Transform3D {
  position: Vector3Tuple;
  rotation: Vector3Tuple;
  scale: Vector3Tuple;
}

export interface MaterialDefinition {
  color: string;
  finish: 'matte' | 'gloss' | 'fabric' | 'wood' | 'metal' | 'painted' | 'unknown';
}

export interface DesignTheme {
  key: string;
  name: string;
  description: string;
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    wall: string;
    floor: string;
    swatches: string[];
  };
}

export interface SpaceConstraint {
  id: string;
  type: 'walkway' | 'wall-clearance' | 'no-overlap' | 'focal-point' | 'lighting' | 'custom';
  description: string;
  itemIds?: string[];
  severity: 'info' | 'warning' | 'blocking';
}

export interface SpaceDefinition {
  id: string;
  name: string;
  description: string;
  dimensions?: {
    width: number;
    depth: number;
    height: number;
  };
  constraints: SpaceConstraint[];
  theme: DesignTheme | null;
}

export interface SpaceItem {
  id: string;
  label: string;
  category: string;
  source: SpaceDesignSource;
  attributes: Record<string, string | number | boolean | string[]>;
  transform: Transform3D | null;
  material: MaterialDefinition | null;
}

export interface SceneObject3D {
  id: string;
  itemId: string;
  label: string;
  category: string;
  transform: Transform3D;
  material: MaterialDefinition;
  confidence: number;
}

export interface SpaceScene {
  versionId: string;
  versionNumber: number;
  renderer: 'three' | 'babylon' | 'server-preview';
  room: {
    width: number;
    depth: number;
    height: number;
    wallColor: string;
    floorMaterial: string;
    layoutConfidence: number;
  };
  objects: SceneObject3D[];
}

export interface PlacementEvaluation {
  id: string;
  tone: EvaluationTone;
  title: string;
  detail: string;
  itemIds: string[];
}

export interface SpaceEvaluation {
  summary: string;
  score: number;
  good: PlacementEvaluation[];
  needsImprovement: PlacementEvaluation[];
}

export type RecommendationAction =
  | { type: 'move-item'; itemId: string; transform: Transform3D }
  | { type: 'add-item'; item: SpaceItem }
  | { type: 'remove-item'; itemId: string }
  | { type: 'change-material'; itemId: string; material: MaterialDefinition }
  | { type: 'change-theme'; themeKey: string };

export interface SpaceRecommendation {
  id: string;
  title: string;
  reasoning: string;
  impact: RecommendationImpact;
  status: RecommendationStatus;
  action: RecommendationAction;
}

export interface SpaceDesignProject {
  id: string;
  mode: SpaceDesignMode;
  space: SpaceDefinition;
  items: SpaceItem[];
  scene: SpaceScene | null;
  evaluation: SpaceEvaluation | null;
  recommendations: SpaceRecommendation[];
  metadata: {
    createdAt: string;
    updatedAt: string;
    source: SpaceDesignSource;
  };
}

export interface CreateSpaceDesignProjectInput {
  mode: SpaceDesignMode;
  description: string;
  items: string[];
  themeKey: string;
  imageNames?: string[];
}
