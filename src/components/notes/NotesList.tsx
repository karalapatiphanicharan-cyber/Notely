import { Plus, Search } from 'lucide-react';
import { useNotesStore } from '../../store/notesStore';
import { NoteCard } from './NoteCard';
import { Button } from '../ui/Button';

export function NotesList() {
  const { notes, selectedNoteId, selectNote, createNote, searchQuery, setSearchQuery } = useNotesStore();

  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full w-full lg:w-80 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Notes
          </h2>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={createNote}>
            <Plus className="h-4 w-4" />
          </Button>
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
          <div className="mt-8 text-center px-4">
            <p className="text-xs text-gray-400 italic">No notes found</p>
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
