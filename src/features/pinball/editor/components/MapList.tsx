'use client';

import React, { useState, useEffect } from 'react';
import { MapListItem, fetchMapList, loadMapFromServer, deleteMapFromServer } from '../services/mapList';
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

  const loadMapList = async () => {
    setLoading(true);
    try {
      const mapList = await fetchMapList();
      setMaps(mapList);
    } catch (error) {
      toast.error(`Failed to load map list: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMap = async (mapName: string) => {
    if (!confirm(`Load map "${mapName}"? Any unsaved changes will be lost.`)) {
      return;
    }

    try {
      const mapData = await loadMapFromServer(mapName);
      loadMap(mapData);
      undoRedoManager.clear();
      toast.success(`Map "${mapName}" loaded successfully!`);
      onClose();
    } catch (error) {
      toast.error(`Failed to load map: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeleteMap = async (mapName: string) => {
    if (!confirm(`Are you sure you want to delete map "${mapName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteMapFromServer(mapName);
      toast.success(`Map "${mapName}" deleted successfully!`);
      loadMapList(); // Refresh the list
    } catch (error) {
      toast.error(`Failed to delete map: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
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
                <div className="col-size">Size</div>
                <div className="col-modified">Last Modified</div>
                <div className="col-actions">Actions</div>
              </div>
              
              {maps.map((map) => (
                <div 
                  key={map.name} 
                  className={`map-list-item ${selectedMap === map.name ? 'selected' : ''}`}
                  onClick={() => setSelectedMap(map.name)}
                >
                  <div className="col-name" title={map.name}>
                    {map.name}
                  </div>
                  <div className="col-size">
                    {formatFileSize(map.size)}
                  </div>
                  <div className="col-modified">
                    {formatDate(map.lastModified)}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMap(map.name);
                      }}
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