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
  Clock,
  CheckCircle2,
  Link as LinkIcon,
  Code
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/Button';
import { ConfirmModal } from '../ui/ConfirmModal';
import { LinkModal } from './LinkModal';
import { CodeModal } from './CodeModal';
import { CollapsibleCodeBlock } from './CollapsibleCodeBlock';
import { cn } from '../../utils/cn';

interface Segment {
  id: string;
  type: 'text' | 'code';
  content: string;
  metadata?: {
    language?: string;
    code?: string;
  };
}

const CODE_REGEX = /:::code\{label="(.*?)"\}\n([\s\S]*?)\n:::/g;

// Helper to convert DOM to Markdown
const domToMd = (node: Node): string => {
  let result = '';
  node.childNodes.forEach(child => {
    if (child.nodeType === Node.TEXT_NODE) {
      result += child.textContent;
    } else if (child.nodeName === 'A') {
      const a = child as HTMLAnchorElement;
      result += `[${a.textContent}](${a.getAttribute('href')})`;
    } else if (child.nodeName === 'BR') {
      result += '\n';
    } else if (child.nodeName === 'DIV' || child.nodeName === 'P') {
      const content = domToMd(child);
      if (content) result += '\n' + content + '\n';
    } else {
      result += domToMd(child);
    }
  });
  return result;
};

// Helper to convert Markdown (with links) to HTML
const mdToHtml = (md: string) => {
  if (!md) return '';
  return md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 underline font-medium cursor-pointer hover:text-blue-700 transition-colors" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\n/g, '<br>');
};

function RichTextEditor({
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder,
  disabled
}: {
  value: string;
  onChange: (val: string) => void;
  onFocus: (el: HTMLDivElement) => void;
  onBlur: (el: HTMLDivElement) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isInternalUpdate, setIsInternalUpdate] = useState(false);

  useEffect(() => {
    if (editorRef.current && !isInternalUpdate) {
      const html = mdToHtml(value);
      if (editorRef.current.innerHTML !== html) {
        editorRef.current.innerHTML = html;
      }
    }
    const timeout = setTimeout(() => {
      setIsInternalUpdate(false);
    }, 0);
    return () => clearTimeout(timeout);
  }, [value, isInternalUpdate]);

  const handleInput = () => {
    if (editorRef.current) {
      const md = domToMd(editorRef.current);
      setIsInternalUpdate(true);
      onChange(md);
    }
  };

  return (
    <div
      ref={editorRef}
      contentEditable={!disabled}
      onInput={handleInput}
      onFocus={() => editorRef.current && onFocus(editorRef.current)}
      onBlur={() => editorRef.current && onBlur(editorRef.current)}
      className={cn(
        "w-full min-h-[1.5em] text-lg leading-relaxed outline-none transition-all",
        !value && "before:content-[attr(data-placeholder)] before:text-gray-200 dark:before:text-gray-800 before:pointer-events-none"
      )}
      data-placeholder={placeholder}
    />
  );
}

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);

  const activeEditorRef = useRef<HTMLDivElement | null>(null);
  const lastSelectionRange = useRef<Range | null>(null);

  const selectedNote = notes.find((n) => n.id === selectedNoteId);

  useEffect(() => {
    if (selectedNote && selectedNote.title === '' && selectedNote.content === '') {
      titleInputRef.current?.focus();
    }
  }, [selectedNoteId, selectedNote]);

  // Reset transient UI state when switching notes
  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowDeleteConfirm(false);
      setShowLinkModal(false);
      setShowCodeModal(false);
      activeEditorRef.current = null;
      lastSelectionRange.current = null;
    }, 0);
    return () => clearTimeout(timeout);
  }, [selectedNoteId]);

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

  const parseContent = (content: string): Segment[] => {
    const segments: Segment[] = [];
    const matches: { index: number; length: number; segment: Segment }[] = [];

    // Find code blocks
    let codeMatch;
    const codeRegexClone = new RegExp(CODE_REGEX);
    while ((codeMatch = codeRegexClone.exec(content)) !== null) {
      matches.push({
        index: codeMatch.index,
        length: codeMatch[0].length,
        segment: {
          id: `code-${codeMatch.index}`,
          type: 'code',
          content: codeMatch[0],
          metadata: { language: codeMatch[1], code: codeMatch[2] }
        }
      });
    }

    matches.sort((a, b) => a.index - b.index);

    let currentIdx = 0;
    for (const match of matches) {
      if (match.index > currentIdx) {
        segments.push({
          id: `text-${currentIdx}`,
          type: 'text',
          content: content.substring(currentIdx, match.index)
        });
      }
      segments.push(match.segment);
      currentIdx = match.index + match.length;
    }

    if (currentIdx < content.length || segments.length === 0) {
      segments.push({
        id: `text-${currentIdx}`,
        type: 'text',
        content: content.substring(currentIdx)
      });
    }

    return segments;
  };

  const segments = parseContent(selectedNote.content);

  const handleUpdateSegment = (segmentId: string, newText: string) => {
    const newSegments = segments.map(s => s.id === segmentId ? { ...s, content: newText } : s);
    const newContent = newSegments.map(s => s.content).join('');
    updateNote(selectedNote.id, { content: newContent });
  };

  const handleRemoveSegment = (segmentId: string) => {
    const newSegments = segments.filter(s => s.id !== segmentId);
    const newContent = newSegments.map(s => s.content).join('');
    updateNote(selectedNote.id, { content: newContent });
  };

  const handleInsertLink = (displayText: string, url: string) => {
    if (!selectedNote) return;

    if (activeEditorRef.current && lastSelectionRange.current) {
      const range = lastSelectionRange.current;
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);

        const a = document.createElement('a');
        a.href = url;
        a.className = "text-blue-600 underline font-medium cursor-pointer hover:text-blue-700 transition-colors";
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = displayText;

        range.deleteContents();
        range.insertNode(a);

        range.setStartAfter(a);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);

        const md = domToMd(activeEditorRef.current);
        const segmentId = segments.find(s => s.type === 'text' && activeEditorRef.current?.contains(activeEditorRef.current))?.id || segments.find(s => s.type === 'text')?.id || '';
        handleUpdateSegment(segmentId, md);
        return;
      }
    }

    // Fallback: append
    const linkMarkdown = `[${displayText}](${url})`;
    const separator = selectedNote.content.length > 0 && !selectedNote.content.endsWith('\n') ? '\n' : '';
    updateNote(selectedNote.id, { content: selectedNote.content + separator + linkMarkdown });
  };

  const handleInsertCode = (language: string, code: string) => {
    if (!selectedNote) return;
    const codeMarkdown = `:::code{label="${language}"}\n${code}\n:::`;

    if (activeEditorRef.current && lastSelectionRange.current) {
        const range = lastSelectionRange.current;
        const marker = document.createTextNode('$$CODE_BLOCK_MARKER$$');
        range.insertNode(marker);
        const md = domToMd(activeEditorRef.current);

        const segmentId = segments.find(s => s.type === 'text' && activeEditorRef.current?.contains(activeEditorRef.current))?.id || segments.find(s => s.type === 'text')?.id;
        if (segmentId) {
            const updatedSegmentContent = md.replace('$$CODE_BLOCK_MARKER$$', `\n${codeMarkdown}\n`);
            handleUpdateSegment(segmentId, updatedSegmentContent);
            return;
        }
    }

    const separator = selectedNote.content.length > 0 && !selectedNote.content.endsWith('\n') ? '\n' : '';
    updateNote(selectedNote.id, { content: selectedNote.content + separator + codeMarkdown + '\n' });
  };

  return (
    <div className="flex h-full flex-col relative overflow-hidden bg-white dark:bg-gray-950">
      <div className="flex-1 flex flex-col p-8 lg:p-12 pb-0 lg:pb-0 overflow-hidden">
        <div className="mb-8 flex items-center justify-between shrink-0">
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
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-600 hover:text-red-700"
                title="Move to trash"
              >
                <Trash className="h-4 w-4" />
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
            ) : null}
          </div>
        </div>

        <div className="relative flex-1 flex flex-col min-h-0">
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
              "mb-6 w-full bg-transparent text-4xl font-bold tracking-tight outline-none placeholder:text-gray-200 dark:placeholder:text-gray-800 transition-opacity shrink-0",
              privacyMode && "opacity-0"
            )}
          />
          <div className={cn("flex-1 overflow-y-auto pb-8 space-y-4", privacyMode && "opacity-0")}>
            {segments.map((segment) => {
                if (segment.type === 'text') {
                    return (
                        <RichTextEditor
                            key={segment.id}
                            value={segment.content}
                            onChange={(val) => handleUpdateSegment(segment.id, val)}
                            onFocus={(el) => {
                                activeEditorRef.current = el;
                            }}
                            onBlur={(el) => {
                                activeEditorRef.current = el;
                                const selection = window.getSelection();
                                if (selection && selection.rangeCount > 0 && el.contains(selection.anchorNode)) {
                                    lastSelectionRange.current = selection.getRangeAt(0).cloneRange();
                                }
                            }}
                            placeholder={segments.length === 1 ? "Start writing..." : ""}
                            disabled={privacyMode}
                        />
                    );
                } else if (segment.type === 'code') {
                    return (
                        <CollapsibleCodeBlock
                            key={segment.id}
                            language={segment.metadata?.language || ''}
                            code={segment.metadata?.code || ''}
                            onDelete={() => handleRemoveSegment(segment.id)}
                        />
                    );
                }
                return null;
            })}
          </div>
        </div>
      </div>

      <div className="flex h-12 shrink-0 items-center justify-between border-t border-gray-100 bg-white px-8 text-[11px] font-medium text-gray-500 lg:px-12 dark:border-gray-900 dark:bg-gray-950 dark:text-gray-400">
        <div className="flex items-center gap-4 lg:gap-6 whitespace-nowrap overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5">
            <span className="text-gray-900 dark:text-gray-100">
              {selectedNote.content.trim() ? selectedNote.content.trim().split(/\s+/).length : 0}
            </span>
            Words
          </div>
          <span className="text-gray-300 dark:text-gray-700">•</span>
          <div className="flex items-center gap-1.5">
            <span className="text-gray-900 dark:text-gray-100">
              {selectedNote.content.length}
            </span>
            Characters
          </div>
          <span className="text-gray-300 dark:text-gray-700">•</span>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-gray-400" />
            <span>
              {Math.max(1, Math.ceil(selectedNote.content.trim().split(/\s+/).length / 200))} Min Read
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 whitespace-nowrap ml-4">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          <span>Last Saved {new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: 'numeric',
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
