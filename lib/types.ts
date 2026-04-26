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
  activeThemeKey: string | null;
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
  key: string;
  name: string;
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    wall: string;
    floor: string;
  };
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface SceneObject {
  id: string;
  category: string;
  label: string;
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
