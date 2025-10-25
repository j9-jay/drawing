'use client';

import dynamic from 'next/dynamic';
import { useEditorStore } from '@/features/pinball/editor/state/editorState';
import { useEffect } from 'react';

// Dynamic imports to prevent SSR issues
const EditorModal = dynamic(() => import('@/features/pinball/editor/components/EditorModal'), {
  ssr: false
});

const EditorButton = dynamic(() => import('@/features/pinball/editor/components/EditorButton'), {
  ssr: false
});

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
