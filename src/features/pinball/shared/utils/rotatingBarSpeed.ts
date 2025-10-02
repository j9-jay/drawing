import { RotatingBarSpeedLevel } from '../types/editorMap';

// Physics constants (내재화: 외부 의존성 제거)
// 원본: ~/pinball-ts/src/client/game/constants/physics.ts
const ROTATING_BAR_SPEED_SLOW = 0.5;
const ROTATING_BAR_SPEED_NORMAL = 1.0;
const ROTATING_BAR_SPEED_FAST = 1.5;

export type RotatingBarSpeedPreset = {
  level: RotatingBarSpeedLevel;
  speed: number;
  label: 'S' | 'M' | 'F';
  color: string;
};

export const ROTATING_BAR_SPEED_PRESETS: RotatingBarSpeedPreset[] = [
  { level: 'slow', speed: ROTATING_BAR_SPEED_SLOW, label: 'S', color: '#0066FF' },
  { level: 'medium', speed: ROTATING_BAR_SPEED_NORMAL, label: 'M', color: '#FFA500' },
  { level: 'fast', speed: ROTATING_BAR_SPEED_FAST, label: 'F', color: '#FF0000' }
];

const SPEED_MATCH_TOLERANCE = 0.001;

function matchPresetBySpeed(speed: number): RotatingBarSpeedPreset | undefined {
  const normalized = Math.abs(speed);
  return ROTATING_BAR_SPEED_PRESETS.find(preset => Math.abs(preset.speed - normalized) <= SPEED_MATCH_TOLERANCE);
}

export function getRotatingBarSpeedPresetByLevel(level: RotatingBarSpeedLevel | undefined): RotatingBarSpeedPreset {
  if (!level) {
    return ROTATING_BAR_SPEED_PRESETS[1];
  }

  const preset = ROTATING_BAR_SPEED_PRESETS.find(candidate => candidate.level === level);
  return preset ?? ROTATING_BAR_SPEED_PRESETS[1];
}

export function getRotatingBarSpeedPresetFromState(
  level: RotatingBarSpeedLevel | undefined,
  speed: number
): RotatingBarSpeedPreset {
  const presetFromLevel = ROTATING_BAR_SPEED_PRESETS.find(candidate => candidate.level === level);
  if (presetFromLevel) {
    return presetFromLevel;
  }

  return matchPresetBySpeed(speed) ?? ROTATING_BAR_SPEED_PRESETS[1];
}

export function getNextRotatingBarSpeedPreset(
  level: RotatingBarSpeedLevel | undefined,
  speed: number
): RotatingBarSpeedPreset {
  const currentPreset = level
    ? getRotatingBarSpeedPresetByLevel(level)
    : matchPresetBySpeed(speed) ?? ROTATING_BAR_SPEED_PRESETS[1];

  const currentIndex = ROTATING_BAR_SPEED_PRESETS.indexOf(currentPreset);
  const nextIndex = (currentIndex + 1) % ROTATING_BAR_SPEED_PRESETS.length;
  return ROTATING_BAR_SPEED_PRESETS[nextIndex];
}
