'use client';

import React from 'react';
import { useEditorStore } from '../state/editorState';
import { Tool } from '../state/slices/toolSlice';

const Toolbox: React.FC = () => {
  const { currentTool, setTool } = useEditorStore();

  const tools: Array<{ id: Tool; name: string; icon: string; shortcut: string; hint: string; usage: string[] }> = [
    {
      id: 'select',
      name: 'Select',
      icon: '↖️',
      shortcut: 'V',
      hint: 'Select and move objects',
      usage: [
        '• Click: Select object',
        '• Drag: Move object',
        '• Drag vertex: Reshape edge',
        '• Edge handles: Resize object',
        '• Special handles: Change properties'
      ]
    },
    {
      id: 'edge',
      name: 'Edge',
      icon: '📐',
      shortcut: 'E',
      hint: 'Draw walls with multiple vertices',
      usage: [
        '• Click mode: Place points → Double-click to finish',
        '• Drag mode: Drag to create 2-point line',
        '• Used for walls and boundaries',
        '• Complex shapes supported'
      ]
    },
    {
      id: 'bubble',
      name: 'Bubble',
      icon: '⚪',
      shortcut: 'B',
      hint: 'Place bouncing bubbles',
      usage: [
        '• Click: Set position',
        '• Drag: Adjust size',
        '• Circular bouncing obstacle',
        '• High restitution for fast bouncing'
      ]
    },
    {
      id: 'rotatingBar',
      name: 'Rotate Bar',
      icon: '🔄',
      shortcut: 'R',
      hint: 'Create rotating obstacles',
      usage: [
        '• Click: Set rotation center',
        '• Drag: Adjust bar length',
        '• Direction handle: Change rotation direction',
        '• Speed handle: Adjust rotation speed'
      ]
    },
    {
      id: 'jumppadRect',
      name: 'Jump Pad',
      icon: '⬆️',
      shortcut: 'J',
      hint: 'Add rectangular jump pad',
      usage: [
        '• Click: Set position',
        '• Drag: Adjust size',
        '• Rectangular jump pad',
        '• Bounces ball upward'
      ]
    },
    {
      id: 'bounceCircle',
      name: 'Jump Circle',
      icon: '⭕',
      shortcut: 'C',
      hint: 'Add circular jump pad',
      usage: [
        '• Click: Set position',
        '• Drag: Adjust radius',
        '• Circular jump pad',
        '• Bounces ball upward'
      ]
    },
    {
      id: 'finishLine',
      name: 'Finish Line',
      icon: '🏁',
      shortcut: 'F',
      hint: 'Mark the finish line',
      usage: [
        '• Click: Set start point',
        '• Drag: Draw line to end point',
        '• Sets game objective location',
        '• Recommended one per map'
      ]
    }
  ];

  return (
    <div className="toolbox">
      <h3 className="toolbox-title">Tools</h3>
      <div className="tool-grid">
        {tools.map((tool) => (
          <button
            key={tool.id}
            className={`tool-button ${currentTool === tool.id ? 'active' : ''}`}
            onClick={() => setTool(tool.id)}
            title={`${tool.hint} (${tool.shortcut})`}
          >
            <div className="tool-icon">
              {tool.icon}
            </div>
            <div>{tool.name}</div>
            <div style={{ fontSize: '10px', opacity: 0.7 }}>({tool.shortcut})</div>
          </button>
        ))}
      </div>
      
      {/* Combined Tool Info and Usage Guide */}
      <div style={{ marginTop: '16px', padding: '14px', background: '#1a1a1a', borderRadius: '6px', fontSize: '12px', color: '#888' }}>
        {/* Current Tool Header */}
        <div style={{ marginBottom: '12px', fontWeight: '600', color: '#ccc', fontSize: '13px' }}>
          {tools.find(t => t.id === currentTool)?.name}
        </div>

        {/* Usage Guide */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ marginBottom: '6px', fontWeight: '600', color: '#ddd', fontSize: '11px' }}>
            📖 How to Use
          </div>
          <div style={{ lineHeight: '1.4', fontSize: '11px', color: '#999' }}>
            {tools.find(t => t.id === currentTool)?.usage.map((line, index) => (
              <div key={index} style={{ marginBottom: '2px' }}>
                {line}
              </div>
            ))}
          </div>
        </div>

        {/* General Tips */}
        <div>
          <div style={{ marginBottom: '6px', fontWeight: '600', color: '#ddd', fontSize: '11px' }}>
            💡 General Tips
          </div>
          <div style={{ lineHeight: '1.3', fontSize: '11px', color: '#999' }}>
            <div>• Space + Drag: Pan camera</div>
            <div>• Ctrl/Cmd + Wheel: Zoom in/out</div>
            <div>• Delete/Backspace: Delete selected</div>
            <div>• Esc: Clear selection or cancel creation</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toolbox;