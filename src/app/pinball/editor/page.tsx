'use client';

import EditorModal from '@/features/pinball/editor/components/EditorModal';
import EditorButton from '@/features/pinball/editor/components/EditorButton';
import { useEditorStore } from '@/features/pinball/editor/state/editorState';
import { useEffect } from 'react';

export default function PinballEditorPage() {
  const { openEditor } = useEditorStore();

  // Auto-open editor on page load
  useEffect(() => {
    openEditor();
  }, [openEditor]);

  return (
    <div className="editor-page">
      <EditorModal />
      <EditorButton />

      <style jsx>{`
        .editor-page {
          width: 100vw;
          height: 100vh;
          background: #0a0a0a;
        }
      `}</style>
    </div>
  );
}
