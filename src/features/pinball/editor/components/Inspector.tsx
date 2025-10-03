'use client';

import React from 'react';
import { useEditorStore } from '../state/editorState';
import { EditorMapObject, Edge, Bubble, RotatingBar, JumpPad, FinishLine, BounceCircle } from '../../../shared/types/editorMap';

const Inspector: React.FC = () => {
  const { map, selectedIds, updateObject } = useEditorStore();
  
  const selectedObjects = map.objects.filter(obj => selectedIds.has(obj.id));
  
  if (selectedObjects.length === 0) {
    return (
      <div className="inspector">
        <h3 className="inspector-title">Properties</h3>
        <div className="inspector-empty">
          Select an object to edit its properties
        </div>
      </div>
    );
  }
  
  if (selectedObjects.length > 1) {
    return (
      <div className="inspector">
        <h3 className="inspector-title">Properties</h3>
        <div className="inspector-empty">
          Multiple objects selected ({selectedObjects.length})<br />
          Select a single object to edit properties
        </div>
      </div>
    );
  }
  
  const selectedObject = selectedObjects[0];
  
  const handleUpdate = (updates: Partial<EditorMapObject>) => {
    updateObject(selectedObject.id, updates);
  };
  
  const renderEdgeProperties = (edge: Edge) => (
    <>
      <div className="property-group">
        <label className="property-label">Vertices ({edge.vertices.length})</label>
        <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>
          Click on canvas to add/edit vertices
        </div>
      </div>
      
      <div className="property-group">
        <label className="property-label">Restitution</label>
        <input
          type="number"
          className="property-input"
          min="0"
          max="2"
          step="0.1"
          value={edge.material?.restitution ?? 0.2}
          onChange={(e) => handleUpdate({
            material: {
              ...edge.material,
              restitution: parseFloat(e.target.value)
            }
          })}
        />
        <small style={{ fontSize: '11px', color: '#888' }}>0.0 = no bounce, 1.0 = full bounce</small>
      </div>
      
      <div className="property-group">
        <label className="property-label">Friction</label>
        <input
          type="number"
          className="property-input"
          min="0"
          max="2"
          step="0.1"
          value={edge.material?.friction ?? 0.5}
          onChange={(e) => handleUpdate({
            material: {
              ...edge.material,
              friction: parseFloat(e.target.value)
            }
          })}
        />
        <small style={{ fontSize: '11px', color: '#888' }}>0.0 = no friction, 1.0 = normal friction</small>
      </div>
    </>
  );
  
  const renderBubbleProperties = (bubble: Bubble) => (
    <>
      <div className="property-group">
        <label className="property-label">Position</label>
        <div className="property-row">
          <input
            type="number"
            className="property-input"
            value={Math.round(bubble.center.x)}
            onChange={(e) => handleUpdate({
              center: { ...bubble.center, x: parseFloat(e.target.value) }
            })}
          />
          <input
            type="number"
            className="property-input"
            value={Math.round(bubble.center.y)}
            onChange={(e) => handleUpdate({
              center: { ...bubble.center, y: parseFloat(e.target.value) }
            })}
          />
        </div>
      </div>
      
      <div className="property-group">
        <label className="property-label">Radius</label>
        <input
          type="number"
          className="property-input"
          min="10"
          max="200"
          value={bubble.radius}
          onChange={(e) => handleUpdate({ radius: parseFloat(e.target.value) })}
        />
      </div>
      
      <div className="property-group">
        <label className="property-label">Restitution</label>
        <input
          type="number"
          className="property-input"
          min="0.5"
          max="3"
          step="0.1"
          value={bubble.restitution ?? 1.4}
          onChange={(e) => handleUpdate({ restitution: parseFloat(e.target.value) })}
        />
        <small style={{ fontSize: '11px', color: '#888' }}>1.0 = normal bounce, 1.5+ = extra bouncy</small>
      </div>
    </>
  );
  
  const renderRotatingBarProperties = (bar: RotatingBar) => (
    <>
      <div className="property-group">
        <label className="property-label">Pivot Position</label>
        <div className="property-row">
          <input
            type="number"
            className="property-input"
            value={Math.round(bar.pivot.x)}
            onChange={(e) => handleUpdate({
              pivot: { ...bar.pivot, x: parseFloat(e.target.value) }
            })}
          />
          <input
            type="number"
            className="property-input"
            value={Math.round(bar.pivot.y)}
            onChange={(e) => handleUpdate({
              pivot: { ...bar.pivot, y: parseFloat(e.target.value) }
            })}
          />
        </div>
      </div>
      
      <div className="property-group">
        <label className="property-label">Length</label>
        <input
          type="number"
          className="property-input"
          min="50"
          max="500"
          value={bar.length}
          onChange={(e) => handleUpdate({ length: parseFloat(e.target.value) })}
        />
      </div>
      
      <div className="property-group">
        <label className="property-label">Thickness</label>
        <input
          type="number"
          className="property-input"
          min="5"
          max="50"
          value={bar.thickness}
          onChange={(e) => handleUpdate({ thickness: parseFloat(e.target.value) })}
        />
      </div>
      
      <div className="property-group">
        <label className="property-label">Angular Speed (rad/s)</label>
        <input
          type="number"
          className="property-input"
          min="-10"
          max="10"
          step="0.1"
          value={bar.angularSpeed}
          onChange={(e) => handleUpdate({ angularSpeed: parseFloat(e.target.value) })}
        />
        <small style={{ fontSize: '11px', color: '#888' }}>Positive = clockwise, Negative = counter-clockwise</small>
      </div>
    </>
  );
  
  const renderBounceCircleProperties = (bounceCircle: BounceCircle) => (
    <>
      <div className="property-group">
        <label className="property-label">Position</label>
        <div className="property-row">
          <input
            type="number"
            className="property-input"
            value={Math.round(bounceCircle.position.x)}
            onChange={(e) => handleUpdate({
              position: { ...bounceCircle.position, x: parseFloat(e.target.value) }
            })}
          />
          <input
            type="number"
            className="property-input"
            value={Math.round(bounceCircle.position.y)}
            onChange={(e) => handleUpdate({
              position: { ...bounceCircle.position, y: parseFloat(e.target.value) }
            })}
          />
        </div>
      </div>

      <div className="property-group">
        <label className="property-label">Radius</label>
        <input
          type="number"
          className="property-input"
          min="10"
          max="200"
          value={bounceCircle.radius}
          onChange={(e) => handleUpdate({ radius: parseFloat(e.target.value) })}
        />
      </div>

      <div className="property-group">
        <label className="property-label">Bounce Multiplier</label>
        <input
          type="number"
          className="property-input"
          min="1"
          max="5"
          step="0.1"
          value={bounceCircle.bounceMultiplier ?? 1.6}
          onChange={(e) => handleUpdate({ bounceMultiplier: parseFloat(e.target.value) })}
        />
        <small style={{ fontSize: '11px', color: '#888' }}>1.0 = normal reflection, 2.0 = double speed</small>
      </div>
    </>
  );

  const renderJumpPadProperties = (jumppad: JumpPad) => (
    <>
      <div className="property-group">
        <label className="property-label">Position</label>
        <div className="property-row">
          <input
            type="number"
            className="property-input"
            value={Math.round(jumppad.position.x)}
            onChange={(e) => handleUpdate({
              position: { ...jumppad.position, x: parseFloat(e.target.value) }
            })}
          />
          <input
            type="number"
            className="property-input"
            value={Math.round(jumppad.position.y)}
            onChange={(e) => handleUpdate({
              position: { ...jumppad.position, y: parseFloat(e.target.value) }
            })}
          />
        </div>
      </div>
      
      <div className="property-group">
        <label className="property-label">Size</label>
        <div className="property-row">
          <input
            type="number"
            className="property-input"
            min="20"
            placeholder="Width"
            value={jumppad.shape.width ?? 160}
            onChange={(e) => handleUpdate({
              shape: { ...jumppad.shape, width: parseFloat(e.target.value) }
            })}
          />
          <input
            type="number"
            className="property-input"
            min="10"
            placeholder="Height"
            value={jumppad.shape.height ?? 30}
            onChange={(e) => handleUpdate({
              shape: { ...jumppad.shape, height: parseFloat(e.target.value) }
            })}
          />
        </div>
      </div>
      
      <div className="property-group">
        <label className="property-label">Bounce Multiplier</label>
        <input
          type="number"
          className="property-input"
          min="1"
          max="5"
          step="0.1"
          value={jumppad.bounceMultiplier ?? 1.6}
          onChange={(e) => handleUpdate({ bounceMultiplier: parseFloat(e.target.value) })}
        />
        <small style={{ fontSize: '11px', color: '#888' }}>1.0 = normal reflection, 2.0 = double speed</small>
      </div>
    </>
  );
  
  const renderFinishLineProperties = (finishLine: FinishLine) => (
    <>
      <div className="property-group">
        <label className="property-label">Start Point</label>
        <div className="property-row">
          <input
            type="number"
            className="property-input"
            value={Math.round(finishLine.a.x)}
            onChange={(e) => handleUpdate({
              a: { ...finishLine.a, x: parseFloat(e.target.value) }
            })}
          />
          <input
            type="number"
            className="property-input"
            value={Math.round(finishLine.a.y)}
            onChange={(e) => handleUpdate({
              a: { ...finishLine.a, y: parseFloat(e.target.value) }
            })}
          />
        </div>
      </div>
      
      <div className="property-group">
        <label className="property-label">End Point</label>
        <div className="property-row">
          <input
            type="number"
            className="property-input"
            value={Math.round(finishLine.b.x)}
            onChange={(e) => handleUpdate({
              b: { ...finishLine.b, x: parseFloat(e.target.value) }
            })}
          />
          <input
            type="number"
            className="property-input"
            value={Math.round(finishLine.b.y)}
            onChange={(e) => handleUpdate({
              b: { ...finishLine.b, y: parseFloat(e.target.value) }
            })}
          />
        </div>
      </div>
      
      <div className="property-group">
        <label className="property-label">Thickness</label>
        <input
          type="number"
          className="property-input"
          min="2"
          max="20"
          value={finishLine.thickness ?? 6}
          onChange={(e) => handleUpdate({ thickness: parseFloat(e.target.value) })}
        />
      </div>
    </>
  );
  
  const renderObjectProperties = (obj: EditorMapObject) => {
    switch (obj.type) {
      case 'edge':
        return renderEdgeProperties(obj);
      case 'bubble':
        return renderBubbleProperties(obj);
      case 'rotatingBar':
        return renderRotatingBarProperties(obj);
      case 'jumppad':
        return renderJumpPadProperties(obj);
      case 'bounceCircle':
        return renderBounceCircleProperties(obj);
      case 'finishLine':
        return renderFinishLineProperties(obj);
      default:
        return <div>Unknown object type</div>;
    }
  };
  
  return (
    <div className="inspector">
      <h3 className="inspector-title">Properties</h3>
      
      <div className="property-group">
        <label className="property-label">Object Type</label>
        <div style={{ padding: '8px', background: '#404040', borderRadius: '4px', color: '#ccc' }}>
          {selectedObject.type}
        </div>
      </div>
      
      <div className="property-group">
        <label className="property-label">Object ID</label>
        <div style={{ padding: '6px', background: '#333', borderRadius: '4px', color: '#888', fontSize: '12px', fontFamily: 'monospace' }}>
          {selectedObject.id}
        </div>
      </div>
      
      {renderObjectProperties(selectedObject)}
    </div>
  );
};

export default Inspector;