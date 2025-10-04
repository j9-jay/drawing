import {
  GameLoopContext,
  startGameLoop
} from '../core/GameLoop';
import {
  buildLoopContext,
  createLoopCallbacks,
  extractLoopState,
  LoopSnapshot,
  LoopStateUpdate,
  syncLoopContext
} from '../core/LoopBindings';

export interface LoopBindings {
  createSnapshot: () => LoopSnapshot;
  // eslint-disable-next-line no-unused-vars
  applyState: (update: LoopStateUpdate) => void;
  onRenderComplete: () => void;
  onWinnerCheck: () => void;
  onEndGame: () => void;
}

export function startLoopWithBindings(bindings: LoopBindings): GameLoopContext {
  const context = buildLoopContext(bindings.createSnapshot());

  const callbacks = createLoopCallbacks({
    onRenderComplete: bindings.onRenderComplete,
    onWinnerCheck: bindings.onWinnerCheck,
    onEndGame: bindings.onEndGame,
    syncContext: (loopContext) => {
      syncLoopContext(loopContext, bindings.createSnapshot());
    },
    onContextUpdated: (loopContext) => {
      const update = extractLoopState(loopContext);
      bindings.applyState(update);
    }
  });

  startGameLoop(context, callbacks);
  return context;
}
