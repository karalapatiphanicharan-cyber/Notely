import { create } from 'zustand';
import type { Note } from '../types/note';
import { notesRepository } from '../db/notesRepository';

interface NotesState {
  notes: Note[];
  selectedNoteId: string | null;
  searchQuery: string;
  isLoading: boolean;

  loadNotes: () => Promise<void>;
  createNote: () => Promise<void>;
  updateNote: (id: string, updates: Partial<Pick<Note, 'title' | 'content'>>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  selectNote: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  getFilteredNotes: () => Note[];
}

const WELCOME_NOTE: Note = {
  id: 'welcome-note',
  title: 'Welcome',
  content: 'Welcome to Notely!\nStart writing your ideas here.',
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

// Map to track debounce timeouts per note ID
const updateTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const flushUpdate = async (id: string, notes: Note[]) => {
  const timeout = updateTimeouts.get(id);
  if (timeout) {
    clearTimeout(timeout);
    updateTimeouts.delete(id);
    const noteToSave = notes.find(n => n.id === id);
    if (noteToSave) {
      try {
        await notesRepository.saveNote(noteToSave);
      } catch (error) {
        console.error('Failed to save note:', error);
      }
    }
  }
};

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  selectedNoteId: null,
  searchQuery: '',
  isLoading: true,

  loadNotes: async () => {
    set({ isLoading: true });
    try {
      const notes = await notesRepository.getAllNotes();

      if (notes.length === 0) {
        await notesRepository.saveNote(WELCOME_NOTE);
        set({
          notes: [WELCOME_NOTE],
          selectedNoteId: WELCOME_NOTE.id,
          isLoading: false
        });
      } else {
        const sortedNotes = [...notes].sort((a, b) => b.updatedAt - a.updatedAt);
        set({
          notes: sortedNotes,
          selectedNoteId: sortedNotes[0].id,
          isLoading: false
        });
      }
    } catch (error) {
      console.error('Failed to load notes:', error);
      set({ isLoading: false });
    }
  },

  getFilteredNotes: () => {
    const { notes, searchQuery } = get();
    const query = searchQuery.trim().toLowerCase();

    const sortedNotes = [...notes].sort((a, b) => b.updatedAt - a.updatedAt);

    if (!query) return sortedNotes;

    return sortedNotes.filter((note) =>
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query)
    );
  },

  createNote: async () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: '',
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    try {
      await notesRepository.saveNote(newNote);
      set((state) => ({
        notes: [newNote, ...state.notes],
        selectedNoteId: newNote.id,
        searchQuery: '',
      }));
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  },

  updateNote: async (id, updates) => {
    const { notes } = get();
    const updatedNotes = notes.map((note) =>
      note.id === id
        ? { ...note, ...updates, updatedAt: Date.now() }
        : note
    );

    set({ notes: updatedNotes });

    // Debounced persistence per note ID
    const existingTimeout = updateTimeouts.get(id);
    if (existingTimeout) clearTimeout(existingTimeout);

    const timeout = setTimeout(async () => {
      updateTimeouts.delete(id);
      const noteToSave = updatedNotes.find(n => n.id === id);
      if (noteToSave) {
        try {
          await notesRepository.saveNote(noteToSave);
        } catch (error) {
          console.error('Failed to save note:', error);
        }
      }
    }, 300);

    updateTimeouts.set(id, timeout);
  },

  deleteNote: async (id) => {
    const { selectedNoteId, getFilteredNotes } = get();
    const filteredBeforeDelete = getFilteredNotes();

    try {
      // Flush any pending updates for this note before deleting
      const timeout = updateTimeouts.get(id);
      if (timeout) {
        clearTimeout(timeout);
        updateTimeouts.delete(id);
      }

      await notesRepository.deleteNote(id);

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
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  },

  selectNote: (id) => {
    const { selectedNoteId, notes } = get();

    // Flush any pending updates for the currently selected note when switching
    if (selectedNoteId && selectedNoteId !== id) {
      flushUpdate(selectedNoteId, notes);
    }

    set({ selectedNoteId: id });
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });

    const { selectedNoteId, getFilteredNotes } = get();
    const filteredNotes = getFilteredNotes();

    if (selectedNoteId && !filteredNotes.some(n => n.id === selectedNoteId)) {
      set({ selectedNoteId: filteredNotes.length > 0 ? filteredNotes[0].id : null });
    }
  },

  clearSearch: () => set({ searchQuery: '' }),
}));
