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
    const { notes, selectedNoteId } = get();
    const filteredNotes = notes.filter((note) => note.id !== id);

    let newSelectedId = selectedNoteId;
    if (selectedNoteId === id) {
      if (filteredNotes.length > 0) {
        // Select next available or previous
        const deletedIndex = notes.findIndex(n => n.id === id);
        newSelectedId = filteredNotes[deletedIndex] ? filteredNotes[deletedIndex].id : filteredNotes[deletedIndex - 1].id;
      } else {
        newSelectedId = null;
      }
    }

    set({
      notes: filteredNotes,
      selectedNoteId: newSelectedId,
    });
  },

  selectNote: (id) => set({ selectedNoteId: id }),

  setSearchQuery: (query) => set({ searchQuery: query }),
}));
