export interface ApiEnvelope<T> {
  message: string;
  data: T;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface Space {
  id: string;
  name: string;
  description: string | null;
  themeId: string;
  theme?: ThemeDefinition;
  activeThemeKey: string | null;
  items: SpaceItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UserMenuItem {
  id: 'profile' | 'spaces' | 'support' | 'contact' | 'logout';
  label: string;
  href: string | null;
  action: 'navigate' | 'logout';
}

export interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  subscription: {
    tier: 'free' | 'paid';
    label: string;
    status: 'active';
  };
}

export interface PasswordVerificationResponse {
  verificationId: string;
  maskedEmail: string;
}

export interface SupportFaq {
  id: string;
  question: string;
  answer: string;
}

export interface SupportChatResponse {
  id: string;
  author: 'SpaceCraft Support Bot';
  message: string;
  createdAt: string;
  suggestedActions: string[];
}

export interface ThemeDefinition {
  id: string;
  key: string;
  name: string;
  focus: string;
  keyElements: string[];
  designSpecs: {
    lighting: string;
    colorPalette: string[];
    texture: string;
  };
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export type SpaceItemVector = [number, number, number];
export type PrimitiveShapeType = 'box' | 'cylinder' | 'sphere';

export interface SpaceItemDimensions {
  width: number;
  height: number;
  depth: number;
  unit: 'm' | 'cm';
}

export interface SpaceItemMaterial {
  color?: string;
  finish?: 'matte' | 'gloss' | 'fabric' | 'wood' | 'metal' | string;
}

export interface SpaceItemCollision {
  buffer: number;
  adjusted: boolean;
  overlapsResolved: number;
}

export interface SpaceItem {
  name: string;
  position: SpaceItemVector;
  rotation: SpaceItemVector;
  shapeType?: PrimitiveShapeType;
  dimensions?: SpaceItemDimensions;
  material?: SpaceItemMaterial;
  mass?: number;
  isDraggable?: boolean;
  collision?: SpaceItemCollision;
  confidence?: number;
  ai?: {
    provider: 'gemini' | 'fallback' | 'mock';
    promptVersion: string;
    reasoning?: string;
  };
}

export interface AiDesignInsight {
  verdict: string;
  score?: number;
  strengths?: string[];
  issues?: string[];
  improvements: string[];
  recommendations: Array<{
    name: string;
    reason: string;
  }>;
  layout: Array<{
    name: string;
    coords: SpaceItemVector;
    rotation: SpaceItemVector;
    dimensions: SpaceItemDimensions;
    shapeType: PrimitiveShapeType;
    material?: SpaceItemMaterial;
    mass: number;
    isDraggable: boolean;
    collision: SpaceItemCollision;
  }>;
}

export interface SceneObject {
  id: string;
  category: string;
  label: string;
  shapeType?: PrimitiveShapeType;
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
  material: {
    color: string;
    finish: string;
  };
  confidence: number;
}

export interface SceneJson {
  room: {
    width: number;
    depth: number;
    height: number;
    wallColor: string;
    floorMaterial: string;
    layoutConfidence: number;
  };
  objects: SceneObject[];
}

export interface SceneVersion {
  id: string;
  versionNumber: number;
  sceneJson: SceneJson;
  confidenceScore: number;
}

export interface Recommendation {
  id: string;
  instruction: string;
  reasoning: string;
  impact: 'low' | 'medium' | 'high';
  status: 'pending' | 'accepted' | 'rejected';
}
