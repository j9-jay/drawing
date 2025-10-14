'use client';

import React, { useState, useEffect } from 'react';
import { MapListItem, fetchMapList, loadMapFromStatic } from '../services/mapList';
import { useEditorStore } from '../state/editorState';
import { undoRedoManager } from '../state/undoRedo';
import { toast } from '../utils/toast';

interface MapListProps {
  isOpen: boolean;
  onClose: () => void;
}

const MapList: React.FC<MapListProps> = ({ isOpen, onClose }) => {
  const [maps, setMaps] = useState<MapListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMap, setSelectedMap] = useState<string | null>(null);
  const { loadMap } = useEditorStore();

  useEffect(() => {
    if (isOpen) {
      loadMapList();
    }
  }, [isOpen]);

  const loadMapList = () => {
    setLoading(true);
    try {
      const mapList = fetchMapList();
      setMaps(mapList);
    } catch (error) {
      toast.error(`Failed to load map list: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMap = (mapName: string) => {
    if (!confirm(`Load map "${mapName}"? Any unsaved changes will be lost.`)) {
      return;
    }

    try {
      const mapData = loadMapFromStatic(mapName);
      if (!mapData) {
        toast.error(`Map "${mapName}" not found`);
        return;
      }
      loadMap(mapData);
      undoRedoManager.clear();
      toast.success(`Map "${mapName}" loaded successfully!`);
      onClose();
    } catch (error) {
      toast.error(`Failed to load map: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="map-list-modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="map-list-modal-content">
        <div className="map-list-header">
          <h2>Load Map</h2>
          <button className="btn btn-close" onClick={onClose}>×</button>
        </div>

        <div className="map-list-body">
          {loading ? (
            <div className="loading">Loading maps...</div>
          ) : maps.length === 0 ? (
            <div className="no-maps">No maps found. Create your first map!</div>
          ) : (
            <div className="map-list">
              <div className="map-list-header-row">
                <div className="col-name">Name</div>
                <div className="col-difficulty">Difficulty</div>
                <div className="col-actions">Actions</div>
              </div>

              {maps.map((map) => (
                <div
                  key={map.name}
                  className={`map-list-item ${selectedMap === map.name ? 'selected' : ''}`}
                  onClick={() => setSelectedMap(map.name)}
                >
                  <div className="col-name" title={map.name}>
                    {map.displayName}
                  </div>
                  <div className="col-difficulty">
                    {map.difficulty ? (
                      <span className={`difficulty-badge ${map.difficulty}`}>
                        {map.difficulty}
                      </span>
                    ) : (
                      <span className="difficulty-badge">-</span>
                    )}
                  </div>
                  <div className="col-actions">
                    <button 
                      className="btn btn-small btn-primary" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLoadMap(map.name);
                      }}
                    >
                      Load
                    </button>
                    <button
                      className="btn btn-small btn-danger"
                      disabled
                      title="Static maps cannot be deleted. Remove from StaticMapLoader.ts and redeploy."
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="map-list-footer">
          <button className="btn" onClick={loadMapList} disabled={loading}>
            Refresh
          </button>
          {selectedMap && (
            <button 
              className="btn btn-primary" 
              onClick={() => handleLoadMap(selectedMap)}
            >
              Load Selected
            </button>
          )}
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapList;