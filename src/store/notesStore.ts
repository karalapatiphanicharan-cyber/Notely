import { create } from 'zustand';
import type { Note } from '../types/note';

interface NotesState {
  notes: Note[];
  selectedNoteId: string | null;
  searchQuery: string;

  createNote: () => void;
  updateNote: (id: string, updates: Partial<Pick<Note, 'title' | 'content'>>) => void;
  deleteNote: (id: string) => void;
  selectNote: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  getFilteredNotes: () => Note[];
}

const DEFAULT_NOTE: Note = {
  id: 'welcome-note',
  title: 'Welcome',
  content: 'Welcome to Notely!\nStart writing your ideas here.',
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [DEFAULT_NOTE],
  selectedNoteId: 'welcome-note',
  searchQuery: '',

  getFilteredNotes: () => {
    const { notes, searchQuery } = get();
    const query = searchQuery.trim().toLowerCase();

    // Sort notes by updatedAt descending
    const sortedNotes = [...notes].sort((a, b) => b.updatedAt - a.updatedAt);

    if (!query) return sortedNotes;

    return sortedNotes.filter((note) =>
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query)
    );
  },

  createNote: () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: '',
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    set((state) => ({
      notes: [newNote, ...state.notes],
      selectedNoteId: newNote.id,
      searchQuery: '', // Clear search on create
    }));
  },

  updateNote: (id, updates) => {
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === id
          ? { ...note, ...updates, updatedAt: Date.now() }
          : note
      ),
    }));
  },

  deleteNote: (id) => {
    const { selectedNoteId, getFilteredNotes } = get();
    const filteredBeforeDelete = getFilteredNotes();

    set((state) => ({
      notes: state.notes.filter((note) => note.id !== id),
    }));

    const filteredAfterDelete = getFilteredNotes();

    if (selectedNoteId === id) {
      if (filteredAfterDelete.length > 0) {
        const deletedIndex = filteredBeforeDelete.findIndex(n => n.id === id);
        const nextSelect = filteredAfterDelete[deletedIndex] || filteredAfterDelete[filteredAfterDelete.length - 1];
        set({ selectedNoteId: nextSelect.id });
      } else {
        set({ selectedNoteId: null });
      }
    }
  },

  selectNote: (id) => set({ selectedNoteId: id }),

  setSearchQuery: (query) => {
    set({ searchQuery: query });

    const { selectedNoteId, getFilteredNotes } = get();
    const filteredNotes = getFilteredNotes();

    // If selected note is no longer in results, select the first visible one
    if (selectedNoteId && !filteredNotes.some(n => n.id === selectedNoteId)) {
      set({ selectedNoteId: filteredNotes.length > 0 ? filteredNotes[0].id : null });
    }
  },

  clearSearch: () => set({ searchQuery: '' }),
}));
