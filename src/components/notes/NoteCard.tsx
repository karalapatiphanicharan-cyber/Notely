import type { Note } from '../../types/note';
import { cn } from '../../utils/cn';
import { Trash2, EyeOff, Pin, Star } from 'lucide-react';
import { useNotesStore } from '../../store/notesStore';
import { useUIStore } from '../../store/uiStore';
import { useEffect, useRef } from 'react';

interface NoteCardProps {
  note: Note;
  isActive: boolean;
  onClick: () => void;
}

export function NoteCard({ note, isActive, onClick }: NoteCardProps) {
  const deleteNote = useNotesStore((state) => state.deleteNote);
  const privacyMode = useUIStore((state) => state.privacyMode);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isActive]);

  const formatPreview = (content: string) => {
    // Completely remove custom code blocks and their content for cards
    // And also strip markdown links and standard code blocks
    return content
      .replace(/:::code\{label=".*?"\}\n([\s\S]*?)\n:::/g, '')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/\n+/g, ' ')
      .trim();
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();

    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      }).format(date);
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      className={cn(
        "group relative cursor-pointer rounded-lg p-4 transition-all hover:bg-gray-50 dark:hover:bg-gray-900",
        isActive && "bg-gray-100 dark:bg-gray-800"
      )}
    >
      <div className="flex justify-between items-start mb-1">
        <div className="flex-1 flex items-center gap-1.5 min-w-0">
          {note.isPinned && <Pin className="h-3 w-3 fill-blue-500 text-blue-500 shrink-0" />}
          <h4 className={cn(
            "line-clamp-1 font-medium text-gray-900 dark:text-gray-100",
            !note.title.trim() && "text-gray-400 italic"
          )}>
            {note.title.trim() || "Untitled"}
          </h4>
        </div>
        <div className="flex items-center gap-2 ml-2 shrink-0">
          {note.isFavorite && <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />}
          <span className="text-[10px] text-gray-400 whitespace-nowrap pt-1">
            {formatTime(note.updatedAt)}
          </span>
        </div>
      </div>
      {privacyMode ? (
        <div className="flex items-center gap-1.5 text-gray-400 italic text-[10px]">
          <EyeOff className="h-3 w-3" />
          <span>Content Hidden</span>
        </div>
      ) : (
        note.content.trim() && (
          <p className="line-clamp-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
            {formatPreview(note.content)}
          </p>
        )
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          deleteNote(note.id);
        }}
        className="absolute right-2 bottom-2 p-1.5 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-500 text-gray-400"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
