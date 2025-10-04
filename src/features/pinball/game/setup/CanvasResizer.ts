export interface CanvasResizeHandle {
  triggerResize: () => Promise<void>;
  dispose: () => void;
}

export function registerCanvasResize(
  canvas: HTMLCanvasElement,
  onResize: () => Promise<void> | void
): CanvasResizeHandle {
  const handler = async () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    await onResize();
  };

  window.addEventListener('resize', handler);
  document.addEventListener('fullscreenchange', handler);

  return {
    triggerResize: async () => {
      await handler();
    },
    dispose: () => {
      window.removeEventListener('resize', handler);
      document.removeEventListener('fullscreenchange', handler);
    }
  };
}
