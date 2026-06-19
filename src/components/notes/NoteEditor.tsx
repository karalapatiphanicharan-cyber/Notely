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
import { ConfirmModal } from '../ui/ConfirmModal';
import { RichTextEditor } from './RichTextEditor';
import { cn } from '../../utils/cn';

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
  const { privacyMode } = useUIStore();
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [isEditMode, setIsEditMode] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
    <div className="flex h-full flex-col p-8 lg:p-12 relative overflow-hidden">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {!selectedNote.isTrashed && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => togglePin(selectedNote.id)}
                className={selectedNote.isPinned ? "text-blue-600 hover:text-blue-700" : "text-gray-400"}
                title={selectedNote.isPinned ? "Unpin note" : "Pin note"}
              >
                <Pin className={selectedNote.isPinned ? "h-4 w-4 fill-current" : "h-4 w-4"} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleFavorite(selectedNote.id)}
                className={selectedNote.isFavorite ? "text-yellow-600 hover:text-yellow-700" : "text-gray-400"}
                title={selectedNote.isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Star className={selectedNote.isFavorite ? "h-4 w-4 fill-current" : "h-4 w-4"} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleArchive(selectedNote.id)}
                className={selectedNote.isArchived ? "text-purple-600 hover:text-purple-700" : "text-gray-400"}
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
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditMode(!isEditMode)}
                className="text-gray-900 font-bold dark:text-gray-100"
                title={isEditMode ? "Switch to Preview Mode" : "Switch to Edit Mode"}
              >
                {isEditMode ? (
                  <>
                    <Eye className="h-4 w-4 lg:mr-2" />
                    <span className="hidden lg:inline">Preview Mode</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="h-4 w-4 lg:mr-2" />
                    <span className="hidden lg:inline">Edit Mode</span>
                  </>
                )}
              </Button>
            </>
          )}

          {selectedNote.isTrashed ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-600 font-bold hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
              title="Delete Permanently"
            >
              <Trash2 className="h-4 w-4 lg:mr-2" />
              <span className="hidden lg:inline">Delete Permanently</span>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-600 font-bold hover:text-red-700"
              title="Move to trash"
            >
              <Trash className="h-4 w-4 lg:mr-2" />
              <span className="hidden lg:inline">Delete</span>
            </Button>
          )}
        </div>
      </div>

      <div className="relative flex-1 flex flex-col">
        {privacyMode && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white dark:bg-gray-950">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="rounded-full bg-gray-50 p-6 dark:bg-gray-900">
                <EyeOff className="h-12 w-12 text-gray-300" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">🔒 Content Hidden</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Privacy Mode is enabled.<br />
                  Disable Privacy Mode to reveal this note.
                </p>
              </div>
            </div>
          </div>
        )}

        <input
          ref={titleInputRef}
          type="text"
          placeholder="Untitled Note"
          value={selectedNote.title}
          disabled={privacyMode || !isEditMode}
          onChange={(e) => updateNote(selectedNote.id, { title: e.target.value })}
          className={cn(
            "mb-6 w-full bg-transparent text-4xl font-bold tracking-tight outline-none placeholder:text-gray-200 dark:placeholder:text-gray-800 transition-opacity",
            privacyMode && "opacity-0",
            !isEditMode && "cursor-default"
          )}
        />
        <div className={cn("flex-1 overflow-hidden flex flex-col", privacyMode && "opacity-0")}>
          <RichTextEditor
            key={isEditMode ? 'edit' : 'preview'}
            content={selectedNote.content}
            disabled={privacyMode || !isEditMode}
            onChange={(content) => updateNote(selectedNote.id, { content })}
          />
        </div>
      </div>

      <div className="mt-auto mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-6 text-[10px] font-medium uppercase tracking-widest text-gray-400 dark:border-gray-900">
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

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title={selectedNote.isTrashed ? "Permanently Delete Note?" : "Move Note to Trash?"}
        message={selectedNote.isTrashed
          ? "This action cannot be undone. This note and all its attachments will be lost forever."
          : "Are you sure you want to move this note to the trash?"}
        onConfirm={() => {
          if (selectedNote.isTrashed) {
            permanentlyDeleteNote(selectedNote.id);
          } else {
            deleteNote(selectedNote.id);
          }
          setShowDeleteConfirm(false);
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
