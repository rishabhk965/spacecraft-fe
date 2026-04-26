import { createTrialSpaceDesignProject } from '../model/trial-space-design';
import {
  CreateSpaceDesignProjectInput,
  SpaceDefinition,
  SpaceDesignProject,
  SpaceEvaluation,
  SpaceRecommendation,
  SpaceScene,
} from '../model/space-design.types';
import { CreateSpaceItemInput, SpaceDesignApiPort, SpaceDesignJob } from './space-design-api.port';

export class TrialSpaceDesignApi implements SpaceDesignApiPort {
  private project: SpaceDesignProject | null = null;

  async createProject(input: CreateSpaceDesignProjectInput): Promise<SpaceDesignProject> {
    this.project = createTrialSpaceDesignProject(input);
    return this.project;
  }

  async getProject(): Promise<SpaceDesignProject> {
    return this.requireProject();
  }

  async updateSpace(_projectId: string, patch: Partial<SpaceDefinition>): Promise<SpaceDesignProject> {
    const project = this.requireProject();
    this.project = {
      ...project,
      space: { ...project.space, ...patch },
      metadata: { ...project.metadata, updatedAt: new Date().toISOString() },
    };
    return this.project;
  }

  async addItem(_projectId: string, _input: CreateSpaceItemInput): Promise<SpaceDesignProject> {
    throw new Error('Trial item mutation is not available after generation yet.');
  }

  async generateScene(projectId: string): Promise<SpaceDesignJob> {
    const project = this.requireProject();
    return {
      id: `trial-job-${projectId}`,
      status: 'completed',
      projectId: project.id,
      sceneVersionId: project.scene?.versionId,
    };
  }

  async getScene(): Promise<SpaceScene> {
    const scene = this.requireProject().scene;
    if (!scene) {
      throw new Error('Trial scene has not been generated yet.');
    }
    return scene;
  }

  async evaluate(): Promise<SpaceEvaluation> {
    const evaluation = this.requireProject().evaluation;
    if (!evaluation) {
      throw new Error('Trial evaluation has not been generated yet.');
    }
    return evaluation;
  }

  async listRecommendations(): Promise<SpaceRecommendation[]> {
    return this.requireProject().recommendations;
  }

  async applyRecommendation(_projectId: string, recommendationId: string): Promise<SpaceDesignProject> {
    return this.updateRecommendation(recommendationId, 'accepted');
  }

  async rejectRecommendation(_projectId: string, recommendationId: string): Promise<SpaceRecommendation> {
    const project = this.updateRecommendation(recommendationId, 'rejected');
    const recommendation = project.recommendations.find((item) => item.id === recommendationId);
    if (!recommendation) {
      throw new Error(`Recommendation ${recommendationId} not found.`);
    }
    return recommendation;
  }

  private updateRecommendation(
    recommendationId: string,
    status: SpaceRecommendation['status'],
  ): SpaceDesignProject {
    const project = this.requireProject();
    this.project = {
      ...project,
      recommendations: project.recommendations.map((recommendation) =>
        recommendation.id === recommendationId ? { ...recommendation, status } : recommendation,
      ),
      metadata: { ...project.metadata, updatedAt: new Date().toISOString() },
    };
    return this.project;
  }

  private requireProject(): SpaceDesignProject {
    if (!this.project) {
      throw new Error('Trial project has not been created yet.');
    }
    return this.project;
  }
}
