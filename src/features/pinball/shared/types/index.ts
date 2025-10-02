// Game types
export type {
  Participant,
  Marble,
  LeaderboardItem,
  GameState,
  WinnerMode,
  MapType,
  GameSettings,
  Toast
} from './game';

// Game objects
export type {
  GameObject,
  Wall,
  Bubble,
  RotatingBar,
  BounceCircle,
  JumpPad,
  FinishLine,
  GameEntity
} from './gameObjects';
export { ObjectType, GameWorld } from './gameObjects';


// Editor map types
export type {
  Vec2,
  EditorEdge,
  EditorBubble,
  EditorRotatingBar,
  EditorJumpPad,
  EditorFinishLine,
  EditorMapObject,
  EditorMapMeta,
  EditorMapJson,
  Edge
} from './editorMap';

export {
  DEFAULT_EDITOR_MAP_META,
  DEFAULT_MATERIAL,
  DEFAULT_BUBBLE_RESTITUTION,
  DEFAULT_BOUNCE_MULTIPLIER,
  DEFAULT_THICKNESS,
  DEFAULT_FINISH_THICKNESS,
  validateEditorMapObject,
  validateEditorMapJson
  // convertEditorMapToMapSpec - temporarily disabled
} from './editorMap';