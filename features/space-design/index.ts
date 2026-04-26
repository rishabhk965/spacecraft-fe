export type {
  CreateSpaceDesignProjectInput,
  DesignTheme,
  MaterialDefinition,
  PlacementEvaluation,
  RecommendationAction,
  SceneObject3D,
  SpaceDefinition,
  SpaceDesignMode,
  SpaceDesignProject,
  SpaceEvaluation,
  SpaceItem,
  SpaceRecommendation,
  SpaceScene,
  Transform3D,
  Vector3Tuple,
} from './model/space-design.types';
export {
  buildSceneAnalysis,
  mapProjectToSceneJson,
} from './model/scene-json.mapper';
export {
  createTrialSpaceDesignProject,
  getTrialDesignTheme,
  parseSpaceItemsInput,
  trialDesignThemes,
} from './model/trial-space-design';
export { mapAuthenticatedSpaceDesignProject } from './model/authenticated-space-design.mapper';
export type { CreateSpaceItemInput, SpaceDesignApiPort, SpaceDesignJob } from './api/space-design-api.port';
export { TrialSpaceDesignApi } from './api/trial-space-design-api';
