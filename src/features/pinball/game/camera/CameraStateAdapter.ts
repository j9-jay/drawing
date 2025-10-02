import { CameraBindingSnapshot, cameraStateFromConfig, ensureCameraConfig } from './CameraBindings';
import { CameraConfig } from './CameraManager';

export interface CameraStateAdapter {
  getConfig(): CameraConfig;
  // eslint-disable-next-line no-unused-vars
  applyConfig(config: CameraConfig): void;
}

export function createCameraStateAdapter(
  getSnapshot: () => CameraBindingSnapshot,
  // eslint-disable-next-line no-unused-vars
  applyState: (state: ReturnType<typeof cameraStateFromConfig>) => void,
  // eslint-disable-next-line no-unused-vars
  setCameraConfig: (config: CameraConfig) => void
): CameraStateAdapter {
  return {
    getConfig(): CameraConfig {
      const config = ensureCameraConfig(getSnapshot());
      setCameraConfig(config);
      return config;
    },
    applyConfig(config: CameraConfig): void {
      applyState(cameraStateFromConfig(config));
      setCameraConfig(config);
    }
  };
}
