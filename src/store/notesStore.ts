import { create } from 'zustand';
import type { Note } from '../types/note';
import type { Attachment } from '../types/attachment';
import { notesRepository } from '../db/notesRepository';
import { attachmentsRepository } from '../db/attachmentsRepository';

interface NotesState {
  notes: Note[];
  selectedNoteId: string | null;
  selectedNoteAttachments: Attachment[];
  searchQuery: string;
  isLoading: boolean;

  loadNotes: () => Promise<void>;
  createNote: () => Promise<void>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  restoreNote: (id: string) => Promise<void>;
  permanentlyDeleteNote: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  toggleArchive: (id: string) => Promise<void>;
  selectNote: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  getFilteredNotes: (path: string) => Note[];

  // Attachment actions
  addAttachment: (noteId: string, file: File) => Promise<void>;
  removeAttachment: (attachmentId: string) => Promise<void>;
  loadAttachments: (noteId: string) => Promise<void>;
}

const WELCOME_NOTE: Note = {
  id: 'welcome-note',
  title: 'Welcome',
  content: 'Welcome to Notely!\nStart writing your ideas here.',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  isPinned: false,
  isFavorite: false,
  isArchived: false,
  isTrashed: false,
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
  selectedNoteAttachments: [],
  searchQuery: '',
  isLoading: true,

  loadNotes: async () => {
    set({ isLoading: true });
    try {
      const notes = await notesRepository.getAllNotes();

      // Migration and normalization
      const normalizedNotes = notes.map(note => ({
        ...note,
        isPinned: note.isPinned ?? false,
        isFavorite: note.isFavorite ?? false,
        isArchived: note.isArchived ?? false,
        isTrashed: note.isTrashed ?? false,
      }));

      if (normalizedNotes.length === 0) {
        await notesRepository.saveNote(WELCOME_NOTE);
        set({
          notes: [WELCOME_NOTE],
          selectedNoteId: WELCOME_NOTE.id,
          isLoading: false
        });
        await get().loadAttachments(WELCOME_NOTE.id);
      } else {
        const initialNoteId = normalizedNotes.find(n => !n.isArchived && !n.isTrashed)?.id || normalizedNotes[0].id;
        set({
          notes: normalizedNotes,
          selectedNoteId: initialNoteId,
          isLoading: false
        });
        if (initialNoteId) {
          await get().loadAttachments(initialNoteId);
        }
      }
    } catch (error) {
      console.error('Failed to load notes:', error);
      set({ isLoading: false });
    }
  },

  getFilteredNotes: (path: string) => {
    const { notes, searchQuery } = get();
    const query = searchQuery.trim().toLowerCase();

    let filtered: Note[];

    if (path === '/favorites') {
      filtered = notes.filter(n => n.isFavorite && !n.isTrashed);
    } else if (path === '/archive') {
      filtered = notes.filter(n => n.isArchived && !n.isTrashed);
    } else if (path === '/trash') {
      filtered = notes.filter(n => n.isTrashed);
    } else {
      // Home or All Notes
      filtered = notes.filter(n => !n.isArchived && !n.isTrashed);
    }

    const sortedNotes = [...filtered].sort((a, b) => {
      // Pinned notes first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      // Then by updatedAt descending
      return b.updatedAt - a.updatedAt;
    });

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
      isPinned: false,
      isFavorite: false,
      isArchived: false,
      isTrashed: false,
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
    const { notes } = get();
    const note = notes.find(n => n.id === id);
    if (!note) return;

    if (note.isTrashed) {
      await get().permanentlyDeleteNote(id);
    } else {
      await get().updateNote(id, { isTrashed: true, isPinned: false });
    }
  },

  restoreNote: async (id) => {
    await get().updateNote(id, { isTrashed: false });
  },

  permanentlyDeleteNote: async (id) => {
    const { selectedNoteId } = get();

    try {
      const timeout = updateTimeouts.get(id);
      if (timeout) {
        clearTimeout(timeout);
        updateTimeouts.delete(id);
      }

      await Promise.all([
        notesRepository.deleteNote(id),
        attachmentsRepository.deleteAttachmentsByNote(id)
      ]);

      set((state) => ({
        notes: state.notes.filter((note) => note.id !== id),
        selectedNoteId: selectedNoteId === id ? null : selectedNoteId,
        selectedNoteAttachments: selectedNoteId === id ? [] : state.selectedNoteAttachments
      }));
    } catch (error) {
      console.error('Failed to permanently delete note:', error);
    }
  },

  togglePin: async (id) => {
    const { notes } = get();
    const note = notes.find(n => n.id === id);
    if (note) {
      await get().updateNote(id, { isPinned: !note.isPinned });
    }
  },

  toggleFavorite: async (id) => {
    const { notes } = get();
    const note = notes.find(n => n.id === id);
    if (note) {
      await get().updateNote(id, { isFavorite: !note.isFavorite });
    }
  },

  toggleArchive: async (id) => {
    const { notes } = get();
    const note = notes.find(n => n.id === id);
    if (note) {
      await get().updateNote(id, { isArchived: !note.isArchived });
    }
  },

  selectNote: (id) => {
    const { selectedNoteId, notes } = get();

    // Flush any pending updates for the currently selected note when switching
    if (selectedNoteId && selectedNoteId !== id) {
      flushUpdate(selectedNoteId, notes);
    }

    // Immediately clear attachments and update ID to avoid stale UI
    set({
      selectedNoteId: id,
      selectedNoteAttachments: []
    });

    if (id) {
      get().loadAttachments(id);
    }
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });

    // We don't need to select a new note here as components handle filtering
  },

  clearSearch: () => set({ searchQuery: '' }),

  loadAttachments: async (noteId) => {
    try {
      const attachments = await attachmentsRepository.getAttachmentsByNote(noteId);
      // Ensure we only set attachments if the note is still selected
      if (get().selectedNoteId === noteId) {
        set({ selectedNoteAttachments: attachments });
      }
    } catch (error) {
      console.error('Failed to load attachments:', error);
    }
  },

  addAttachment: async (noteId, file) => {
    const attachment: Attachment = {
      id: crypto.randomUUID(),
      noteId,
      type: file.type.startsWith('image/') ? 'image' : 'pdf',
      name: file.name,
      size: file.size,
      mimeType: file.type,
      data: file,
      createdAt: Date.now(),
    };

    try {
      await attachmentsRepository.saveAttachment(attachment);
      const { selectedNoteId } = get();
      if (selectedNoteId === noteId) {
        set((state) => ({
          selectedNoteAttachments: [...state.selectedNoteAttachments, attachment]
        }));
      }
    } catch (error) {
      console.error('Failed to add attachment:', error);
    }
  },

  removeAttachment: async (attachmentId) => {
    try {
      await attachmentsRepository.deleteAttachment(attachmentId);
      set((state) => ({
        selectedNoteAttachments: state.selectedNoteAttachments.filter(a => a.id !== attachmentId)
      }));
    } catch (error) {
      console.error('Failed to remove attachment:', error);
    }
  },
}));
