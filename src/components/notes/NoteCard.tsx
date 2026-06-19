import type { Note } from '../../types/note';
import { cn } from '../../utils/cn';
import { Trash2 } from 'lucide-react';
import { useNotesStore } from '../../store/notesStore';

interface NoteCardProps {
  note: Note;
  isActive: boolean;
  onClick: () => void;
}

export function NoteCard({ note, isActive, onClick }: NoteCardProps) {
  const deleteNote = useNotesStore((state) => state.deleteNote);

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
      onClick={onClick}
      className={cn(
        "group relative cursor-pointer rounded-lg p-4 transition-all hover:bg-gray-50 dark:hover:bg-gray-900",
        isActive && "bg-gray-100 dark:bg-gray-800"
      )}
    >
      <div className="flex justify-between items-start mb-1">
        <h4 className={cn(
          "line-clamp-1 flex-1 font-medium text-gray-900 dark:text-gray-100",
          !note.title.trim() && "text-gray-400 italic"
        )}>
          {note.title.trim() || "Untitled Note"}
        </h4>
        <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2 pt-1">
          {formatTime(note.updatedAt)}
        </span>
      </div>
      <p className={cn(
        "line-clamp-2 text-xs leading-relaxed",
        note.content.trim() ? "text-gray-500 dark:text-gray-400" : "text-gray-400 italic"
      )}>
        {note.content.trim() || "No content"}
      </p>

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
