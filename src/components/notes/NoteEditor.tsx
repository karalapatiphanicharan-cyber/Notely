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
  CheckCircle2,
  Link as LinkIcon,
  Code,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/Button';
import { ConfirmModal } from '../ui/ConfirmModal';
import { LinkModal } from './LinkModal';
import { CodeModal } from './CodeModal';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);

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

  const handleInsertLink = (displayText: string, url: string) => {
    if (!selectedNote) return;
    const linkMarkdown = `\n[${displayText}](${url})\n`;
    updateNote(selectedNote.id, { content: selectedNote.content + linkMarkdown });
  };

  const handleInsertCode = (language: string, code: string) => {
    if (!selectedNote) return;
    const codeMarkdown = `\n:::code[${language}]\n${code}\n:::\n`;
    updateNote(selectedNote.id, { content: selectedNote.content + codeMarkdown });
  };

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
              <div className="mx-2 h-4 w-px bg-gray-200 dark:bg-gray-800" />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowLinkModal(true)}
                className="text-gray-400 hover:text-blue-600"
                title="Insert Link"
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowCodeModal(true)}
                className="text-gray-400 hover:text-purple-600"
                title="Insert Code Block"
              >
                <Code className="h-4 w-4" />
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
          disabled={privacyMode}
          onChange={(e) => updateNote(selectedNote.id, { title: e.target.value })}
          className={cn(
            "mb-6 w-full bg-transparent text-4xl font-bold tracking-tight outline-none placeholder:text-gray-200 dark:placeholder:text-gray-800 transition-opacity",
            privacyMode && "opacity-0"
          )}
        />
        <div className={cn("flex-1", privacyMode && "opacity-0")}>
          {isEditMode ? (
            <textarea
              placeholder="Start writing..."
              value={selectedNote.content}
              disabled={privacyMode}
              onChange={(e) => updateNote(selectedNote.id, { content: e.target.value })}
              className="h-full w-full resize-none bg-transparent text-lg leading-relaxed outline-none placeholder:text-gray-200 dark:placeholder:text-gray-800"
            />
          ) : (
            <div className="h-full w-full overflow-y-auto prose dark:prose-invert max-w-none prose-slate">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ ...props }) => (
                    <a
                      {...props}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    />
                  ),
                  p: ({ children }) => {
                    const content = Array.isArray(children) ? children.join('') : String(children);
                    const codeMatch = content.match(/^:::code\[(.*?)]\n([\s\S]*?)\n:::$/);

                    if (codeMatch) {
                      return (
                        <CollapsibleCodeBlock language={codeMatch[1]}>
                          {codeMatch[2]}
                        </CollapsibleCodeBlock>
                      );
                    }

                    return <p>{children}</p>;
                  }
                }}
              >
                {selectedNote.content || "_No content to preview_"}
              </ReactMarkdown>
            </div>
          )}
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

      <LinkModal
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        onInsert={handleInsertLink}
      />

      <CodeModal
        isOpen={showCodeModal}
        onClose={() => setShowCodeModal(false)}
        onInsert={handleInsertCode}
      />
    </div>
  );
}

function CollapsibleCodeBlock({ language, children }: { language: string, children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="my-4 overflow-hidden rounded-lg border border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-900"
      >
        <span className="flex items-center gap-2">
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          {language} Code
        </span>
        <span className="text-[10px] text-gray-400 uppercase tracking-widest">
          {isOpen ? 'Click to collapse' : 'Click to expand'}
        </span>
      </button>
      {isOpen && (
        <div className="border-t border-gray-100 p-4 dark:border-gray-800">
          <pre className="m-0 overflow-x-auto p-0 bg-transparent">
            <code className="text-sm font-mono leading-relaxed whitespace-pre">
              {children}
            </code>
          </pre>
        </div>
      )}
    </div>
  );
}
