'use client';

import React from 'react';
import { useEditorStore } from '../state/editorState';

const EditorButton: React.FC = () => {
  const { isOpen, openEditor } = useEditorStore();
  
  if (isOpen) return null; // Hide when editor modal is open
  
  return (
    <button
      className="editor-floating-button"
      onClick={openEditor}
      title="Open Map Editor (E)"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 17.25V21h3.75l11-11-3.75-3.75-11 11zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
      </svg>
      Editor
    </button>
  );
};

export default EditorButton;