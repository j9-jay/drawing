import { EditorMapJson } from '../../../shared/types/editorMap';

export type HistoryAction = {
  id: string;
  timestamp: number;
  description: string;
  before: EditorMapJson;
  after: EditorMapJson;
};

export class UndoRedoManager {
  private undoStack: HistoryAction[] = [];
  private redoStack: HistoryAction[] = [];
  private maxHistorySize = 100;
  
  pushAction(description: string, before: EditorMapJson, after: EditorMapJson) {
    const action: HistoryAction = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      description,
      before: JSON.parse(JSON.stringify(before)), // deep clone
      after: JSON.parse(JSON.stringify(after))
    };
    
    this.undoStack.push(action);
    this.redoStack = []; // clear redo stack when new action is performed
    
    // Limit stack size
    if (this.undoStack.length > this.maxHistorySize) {
      this.undoStack.shift();
    }
  }
  
  canUndo(): boolean {
    return this.undoStack.length > 0;
  }
  
  canRedo(): boolean {
    return this.redoStack.length > 0;
  }
  
  undo(): EditorMapJson | null {
    const action = this.undoStack.pop();
    if (!action) return null;
    
    this.redoStack.push(action);
    return action.before;
  }
  
  redo(): EditorMapJson | null {
    const action = this.redoStack.pop();
    if (!action) return null;
    
    this.undoStack.push(action);
    return action.after;
  }
  
  clear() {
    this.undoStack = [];
    this.redoStack = [];
  }
  
  getUndoDescription(): string | null {
    const lastAction = this.undoStack[this.undoStack.length - 1];
    return lastAction?.description || null;
  }
  
  getRedoDescription(): string | null {
    const lastAction = this.redoStack[this.redoStack.length - 1];
    return lastAction?.description || null;
  }
}

// Global instance
export const undoRedoManager = new UndoRedoManager();