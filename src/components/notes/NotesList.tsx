import { Plus, Search } from 'lucide-react';
import { useNotesStore } from '../../store/notesStore';
import { NoteCard } from './NoteCard';
import { Button } from '../ui/Button';
import { useLocation } from 'react-router-dom';

export function NotesList() {
  const { selectedNoteId, selectNote, createNote, searchQuery, setSearchQuery, getFilteredNotes } = useNotesStore();
  const location = useLocation();

  const filteredNotes = getFilteredNotes(location.pathname);

  return (
    <div className="flex h-full w-full lg:w-80 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            {location.pathname === '/favorites' ? 'Favorites' :
             location.pathname === '/archive' ? 'Archive' :
             location.pathname === '/trash' ? 'Trash' : 'Notes'}
          </h2>
          {location.pathname !== '/trash' && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={createNote}>
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="relative sm:hidden">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-md border border-gray-100 bg-gray-50 pl-9 pr-4 text-xs outline-none focus:ring-2 focus:ring-black/5 dark:border-gray-800 dark:bg-gray-900 dark:focus:ring-white/5"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
        {filteredNotes.length === 0 ? (
          <div className="mt-12 text-center px-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {searchQuery.trim() ? "No matching notes found" : "No notes yet"}
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {searchQuery.trim()
                ? "Try a different keyword or clear your search."
                : "Create your first note to begin."}
            </p>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              isActive={selectedNoteId === note.id}
              onClick={() => selectNote(note.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
