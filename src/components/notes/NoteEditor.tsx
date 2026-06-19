import { useNotesStore } from '../../store/notesStore';
import { EmptyState } from '../ui/EmptyState';
import { Plus } from 'lucide-react';
import { useEffect, useRef } from 'react';

export function NoteEditor() {
  const { notes, selectedNoteId, updateNote, createNote } = useNotesStore();
  const titleInputRef = useRef<HTMLInputElement>(null);

  const selectedNote = notes.find((n) => n.id === selectedNoteId);

  useEffect(() => {
    if (selectedNote && selectedNote.title === '') {
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
      <textarea
        placeholder="Start writing..."
        value={selectedNote.content}
        onChange={(e) => updateNote(selectedNote.id, { content: e.target.value })}
        className="flex-1 w-full resize-none bg-transparent text-lg leading-relaxed outline-none placeholder:text-gray-200 dark:placeholder:text-gray-800"
      />
    </div>
  );
}
