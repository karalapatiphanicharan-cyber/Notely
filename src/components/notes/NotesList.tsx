import { Plus, Search, ChevronLeft, ChevronRight, FileText, Eye, EyeOff } from 'lucide-react';
import { useNotesStore } from '../../store/notesStore';
import { NoteCard } from './NoteCard';
import { Button } from '../ui/Button';
import { useLocation } from 'react-router-dom';
import { useUIStore } from '../../store/uiStore';

export function NotesList() {
  const { selectedNoteId, selectNote, createNote, searchQuery, setSearchQuery, getFilteredNotes } = useNotesStore();
  const { isNotesListCollapsed, toggleNotesListCollapse, privacyMode, togglePrivacyMode } = useUIStore();
  const location = useLocation();

  const filteredNotes = getFilteredNotes(location.pathname);

  if (isNotesListCollapsed) {
    return (
      <div className="flex h-full w-16 flex-col items-center border-r border-gray-200 bg-white py-4 dark:border-gray-800 dark:bg-gray-950 transition-all duration-300">
        <Button variant="ghost" size="icon" onClick={toggleNotesListCollapse} className="mb-4 h-8 w-8 text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
          <ChevronRight className="h-4 w-4" />
        </Button>
        <div className="flex flex-col items-center gap-6">
          <FileText className="h-5 w-5 text-gray-400" />
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePrivacyMode}
            className={privacyMode ? "text-blue-600" : "text-gray-400"}
          >
            {privacyMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full lg:w-80 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 transition-all duration-300">
      <div className="p-4 space-y-4 border-b border-gray-100 dark:border-gray-900 text-gray-400">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 hidden lg:flex text-gray-400 hover:text-gray-900 dark:hover:text-gray-100" onClick={toggleNotesListCollapse}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-widest">
              {location.pathname === '/favorites' ? 'Favorites' :
               location.pathname === '/archive' ? 'Archive' :
               location.pathname === '/trash' ? 'Trash' : 'Notes'}
            </h2>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={privacyMode ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20" : "text-gray-400"}
              onClick={togglePrivacyMode}
              title={privacyMode ? "Disable Privacy Mode" : "Enable Privacy Mode"}
            >
              {privacyMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            {location.pathname !== '/trash' && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={createNote} title="Create Note">
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
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
