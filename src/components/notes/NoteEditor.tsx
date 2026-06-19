import { useNotesStore } from '../../store/notesStore';
import { useUIStore } from '../../store/uiStore';
import { EmptyState } from '../ui/EmptyState';
import { Plus, EyeOff } from 'lucide-react';
import { useEffect, useRef } from 'react';

export function NoteEditor() {
  const { notes, selectedNoteId, updateNote, createNote } = useNotesStore();
  const privacyMode = useUIStore((state) => state.privacyMode);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const selectedNote = notes.find((n) => n.id === selectedNoteId);

  useEffect(() => {
    if (selectedNote && selectedNote.title === '' && selectedNote.content === '') {
      titleInputRef.current?.focus();
    }
  }, [selectedNoteId, selectedNote]);

  if (!selectedNote) {
    return (
      <div className="flex h-full items-center justify-center">
        <EmptyState
          icon={<Plus className="h-12 w-12" />}
          title="No notes yet"
          subtitle="Create your first note to begin."
          actionLabel="Create Note"
          onAction={createNote}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col p-8 lg:p-12">
      <input
        ref={titleInputRef}
        type="text"
        placeholder="Untitled Note"
        value={selectedNote.title}
        onChange={(e) => updateNote(selectedNote.id, { title: e.target.value })}
        className="mb-6 w-full bg-transparent text-4xl font-bold tracking-tight outline-none placeholder:text-gray-200 dark:placeholder:text-gray-800"
      />
      <div className="relative flex-1">
        {privacyMode && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm dark:bg-gray-950/90">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="rounded-full bg-gray-100 p-4 dark:bg-gray-900">
                <EyeOff className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Content Hidden</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Disable Privacy Mode to view and edit this note.</p>
              </div>
            </div>
          </div>
        )}
        <textarea
          placeholder="Start writing..."
          value={selectedNote.content}
          onChange={(e) => updateNote(selectedNote.id, { content: e.target.value })}
          className="h-full w-full resize-none bg-transparent text-lg leading-relaxed outline-none placeholder:text-gray-200 dark:placeholder:text-gray-800"
        />
      </div>
    </div>
  );
}
