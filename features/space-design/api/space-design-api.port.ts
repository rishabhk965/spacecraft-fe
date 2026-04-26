import {
  CreateSpaceDesignProjectInput,
  SpaceDefinition,
  SpaceDesignProject,
  SpaceEvaluation,
  SpaceItem,
  SpaceRecommendation,
  SpaceScene,
} from '../model/space-design.types';

export interface CreateSpaceItemInput {
  label: string;
  category?: string;
  attributes?: SpaceItem['attributes'];
}

export interface SpaceDesignJob {
  id: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  projectId: string;
  sceneVersionId?: string;
  errorMessage?: string;
}

export interface SpaceDesignApiPort {
  createProject(input: CreateSpaceDesignProjectInput): Promise<SpaceDesignProject>;
  getProject(projectId: string): Promise<SpaceDesignProject>;
  updateSpace(projectId: string, patch: Partial<SpaceDefinition>): Promise<SpaceDesignProject>;
  addItem(projectId: string, input: CreateSpaceItemInput): Promise<SpaceDesignProject>;
  generateScene(projectId: string): Promise<SpaceDesignJob>;
  getScene(projectId: string): Promise<SpaceScene>;
  evaluate(projectId: string): Promise<SpaceEvaluation>;
  listRecommendations(projectId: string): Promise<SpaceRecommendation[]>;
  applyRecommendation(projectId: string, recommendationId: string): Promise<SpaceDesignProject>;
  rejectRecommendation(projectId: string, recommendationId: string): Promise<SpaceRecommendation>;
}
