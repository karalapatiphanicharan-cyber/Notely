import { useEffect } from 'react';
import { useNotesStore } from '../store/notesStore';
import { useUIStore } from '../store/uiStore';

export function useKeyboardShortcuts() {
  const createNote = useNotesStore((state) => state.createNote);
  const togglePrivacyMode = useUIStore((state) => state.togglePrivacyMode);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + N -> New Note
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        createNote();
      }

      // Ctrl/Cmd + F -> Focus Search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        searchInput?.focus();
      }

      // Ctrl/Cmd + Shift + P -> Toggle Privacy Mode
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        togglePrivacyMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [createNote, togglePrivacyMode]);
}
