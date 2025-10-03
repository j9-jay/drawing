'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { useEditorStore } from '../state/editorState';
import { undoRedoManager } from '../state/undoRedo';
import CanvasView from './canvas/CanvasView';
import Toolbox from './Toolbox';
// import Inspector from './Inspector'; // Removed properties panel
import { saveMap } from '../services/save';
import { createFileLoadDialog } from '../services/load';
import { validateEditorMapJson } from '../../../shared/types/editorMap';
import { toast } from '../utils/toast';
import { GameIntegration } from '../services/GameIntegration';
import Minimap from './Minimap';
import MapList from './MapList';
import '../editor.css';

const EditorModal: React.FC = () => {
  const [isMapListOpen, setIsMapListOpen] = useState(false);
  
  const {
    isOpen,
    closeEditor,
    map,
    setMapName,
    loadMap,
    newMap,
    currentTool,
    setTool
  } = useEditorStore();

  const handleUndo = useCallback(() => {
    const previousState = undoRedoManager.undo();
    if (previousState) {
      loadMap(previousState);
    }
  }, [loadMap]);

  const handleRedo = useCallback(() => {
    const nextState = undoRedoManager.redo();
    if (nextState) {
      loadMap(nextState);
    }
  }, [loadMap]);

  const handleSave = useCallback(async () => {
    // Validate map before saving
    const errors = validateEditorMapJson(map);
    if (errors.length > 0) {
      toast.error(`Cannot save map:\n• ${errors.join('\n• ')}`, { duration: 5000 });
      return;
    }

    // Check if map name is provided
    if (!map.meta.name.trim()) {
      toast.warning('Please enter a map name before saving');
      return;
    }

    try {
      await saveMap(map);
      toast.success(`Map "${map.meta.name}" saved successfully!`);
    } catch (error) {
      console.error('Save failed:', error);
      toast.error(`Failed to save map: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [map]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'v':
          setTool('select');
          e.preventDefault();
          break;
        case 'e':
          setTool('edge');
          e.preventDefault();
          break;
        case 'b':
          setTool('bubble');
          e.preventDefault();
          break;
        case 'r':
          setTool('rotatingBar');
          e.preventDefault();
          break;
        case 'j':
          setTool('jumppadRect');
          e.preventDefault();
          break;
        case 'c':
          setTool('bounceCircle');
          e.preventDefault();
          break;
        case 'f':
          setTool('finishLine');
          e.preventDefault();
          break;
        case 'escape':
          closeEditor();
          e.preventDefault();
          break;
        case 'delete':
        case 'backspace':
          // Handle deletion in CanvasView
          break;
        case 'z':
          if (e.ctrlKey || e.metaKey) {
            if (e.shiftKey) {
              // Redo
              handleRedo();
            } else {
              // Undo
              handleUndo();
            }
            e.preventDefault();
          }
          break;
        case 'y':
          if (e.ctrlKey || e.metaKey) {
            handleRedo();
            e.preventDefault();
          }
          break;
        case 's':
          if (e.ctrlKey || e.metaKey) {
            handleSave();
            e.preventDefault();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setTool, closeEditor, handleUndo, handleRedo, handleSave]);

  const handleNewMap = useCallback(() => {
    if (confirm('Create new map? Any unsaved changes will be lost.')) {
      newMap();
      undoRedoManager.clear();
    }
  }, [newMap]);

  const handleLoad = useCallback(async () => {
    try {
      const mapJson = await createFileLoadDialog();
      if (mapJson) {
        loadMap(mapJson);
        undoRedoManager.clear();
        toast.success(`Map "${mapJson.meta.name}" loaded successfully!`);
      }
    } catch (error) {
      console.error('Load failed:', error);
      toast.error(`Failed to load map: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [loadMap]);

  const handleExportForGame = useCallback(async () => {
    // Validate map for game conversion
    const conversionErrors = GameIntegration.validateForGameConversion(map);
    if (conversionErrors.length > 0) {
      toast.error(`Cannot export for game:\n• ${conversionErrors.join('\n• ')}`, { duration: 5000 });
      return;
    }

    try {
      await GameIntegration.saveAsGameMap(map);
      toast.success(`Map "${map.meta.name}" exported for game successfully!`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(`Failed to export map for game: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [map]);

  const handleClose = useCallback(() => {
    if (confirm('Close editor? Any unsaved changes will be lost.')) {
      closeEditor();
    }
  }, [closeEditor]);

  if (!isOpen) return null;

  return (
    <div className="editor-modal" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="editor-modal-content">
        <header className="editor-header">
          <h1 className="editor-title">Map Editor</h1>
          <input
            type="text"
            className="map-name-input"
            value={map.meta.name}
            onChange={(e) => setMapName(e.target.value)}
            placeholder="Enter map name..."
          />
          <div className="editor-header-actions">
            <button className="btn" onClick={handleNewMap} title="New Map (Ctrl+N)">
              New
            </button>
            <button className="btn" onClick={() => setIsMapListOpen(true)} title="Load Map from Server">
              Load from Server
            </button>
            <button className="btn" onClick={handleLoad} title="Load Map from File">
              Load from File
            </button>
            <button className="btn" onClick={handleUndo} disabled={!undoRedoManager.canUndo()}>
              Undo
            </button>
            <button className="btn" onClick={handleRedo} disabled={!undoRedoManager.canRedo()}>
              Redo
            </button>
            <button className="btn btn-primary" onClick={handleSave} title="Save Map (Ctrl+S)">
              Save
            </button>
            <button className="btn" onClick={handleExportForGame} title="Export for Game">
              Export for Game
            </button>
            <button className="btn btn-danger" onClick={handleClose} title="Close (Esc)">
              Close
            </button>
          </div>
        </header>

        <main className="editor-main">
          <aside className="editor-minimap-sidebar">
            <Minimap />
          </aside>

          <div className="editor-canvas-area">
            <CanvasView />
            <div className="canvas-status">
              <div className="status-item">
                <span className="status-label">Tool:</span>
                <span>{currentTool}</span>
              </div>
              <div className="status-item">
                <span className="status-label">Objects:</span>
                <span>{map.objects.length}</span>
              </div>
              <div className="status-item">
                <span className="status-label">Grid:</span>
                <span>{map.meta.gridSize}px</span>
              </div>
            </div>
          </div>

          <aside className="editor-sidebar">
            <Toolbox />
            {/* <Inspector /> Properties panel removed */}
          </aside>
        </main>

        <div className="shortcuts-hint">
          <strong>Shortcuts:</strong><br />
          V - Select, E - Edge, B - Bubble, R - Rotate Bar, J - Jump Pad, F - Finish Line<br />
          Ctrl+Z/Y - Undo/Redo, Ctrl+S - Save, Del - Delete, Esc - Close
        </div>
      </div>
      
      <MapList isOpen={isMapListOpen} onClose={() => setIsMapListOpen(false)} />
    </div>
  );
};

export default EditorModal;