import { useNotesStore } from '../../store/notesStore';
import { useUIStore } from '../../store/uiStore';
import { EmptyState } from '../ui/EmptyState';
import {
  Plus,
  EyeOff,
  Pin,
  Star,
  Archive,
  RotateCcw,
  Trash2,
  Trash,
  Edit3,
  Eye,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/Button';
import ReactMarkdown from 'react-markdown';

export function NoteEditor() {
  const {
    notes,
    selectedNoteId,
    updateNote,
    createNote,
    togglePin,
    toggleFavorite,
    toggleArchive,
    restoreNote,
    deleteNote,
    permanentlyDeleteNote
  } = useNotesStore();
  const privacyMode = useUIStore((state) => state.privacyMode);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [isEditMode, setIsEditMode] = useState(true);

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
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {!selectedNote.isTrashed && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => togglePin(selectedNote.id)}
                className={selectedNote.isPinned ? "text-blue-500 hover:text-blue-600" : "text-gray-400"}
                title={selectedNote.isPinned ? "Unpin note" : "Pin note"}
              >
                <Pin className={selectedNote.isPinned ? "h-4 w-4 fill-current" : "h-4 w-4"} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleFavorite(selectedNote.id)}
                className={selectedNote.isFavorite ? "text-yellow-500 hover:text-yellow-600" : "text-gray-400"}
                title={selectedNote.isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Star className={selectedNote.isFavorite ? "h-4 w-4 fill-current" : "h-4 w-4"} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleArchive(selectedNote.id)}
                className={selectedNote.isArchived ? "text-purple-500 hover:text-purple-600" : "text-gray-400"}
                title={selectedNote.isArchived ? "Restore from archive" : "Archive note"}
              >
                <Archive className={selectedNote.isArchived ? "h-4 w-4 fill-current" : "h-4 w-4"} />
              </Button>
            </>
          )}
          {selectedNote.isTrashed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => restoreNote(selectedNote.id)}
              className="text-green-600 hover:text-green-700"
              title="Restore note"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!selectedNote.isTrashed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditMode(!isEditMode)}
              className="text-gray-500 hover:text-gray-700"
              title={isEditMode ? "Switch to Preview" : "Switch to Edit"}
            >
              {isEditMode ? (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </>
              ) : (
                <>
                  <Edit3 className="mr-2 h-4 w-4" />
                  Edit
                </>
              )}
            </Button>
          )}

          {selectedNote.isTrashed ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => permanentlyDeleteNote(selectedNote.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Permanently
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteNote(selectedNote.id)}
              className="text-gray-400 hover:text-red-500"
              title="Move to trash"
            >
              <Trash className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

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
        {isEditMode ? (
          <textarea
            placeholder="Start writing..."
            value={selectedNote.content}
            onChange={(e) => updateNote(selectedNote.id, { content: e.target.value })}
            className="h-full w-full resize-none bg-transparent text-lg leading-relaxed outline-none placeholder:text-gray-200 dark:placeholder:text-gray-800"
          />
        ) : (
          <div className="h-full w-full overflow-y-auto prose dark:prose-invert max-w-none prose-slate">
            <ReactMarkdown>{selectedNote.content || "_No content to preview_"}</ReactMarkdown>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-6 text-[10px] font-medium uppercase tracking-widest text-gray-400 dark:border-gray-900">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5">
            <span className="text-gray-900 dark:text-gray-100">
              {selectedNote.content.trim() ? selectedNote.content.trim().split(/\s+/).length : 0}
            </span>
            Words
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-gray-900 dark:text-gray-100">
              {selectedNote.content.length}
            </span>
            Characters
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            <span>
              {Math.max(1, Math.ceil(selectedNote.content.trim().split(/\s+/).length / 200))} min read
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-3 w-3 text-green-500" />
          <span>Last saved {new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: true,
          }).format(selectedNote.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
}
