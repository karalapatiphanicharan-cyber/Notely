import { initDB } from './indexedDb';
import type { Note } from '../types/note';

export const notesRepository = {
  async getAllNotes(): Promise<Note[]> {
    const db = await initDB();
    return db.getAll('notes');
  },

  async getNote(id: string): Promise<Note | undefined> {
    const db = await initDB();
    return db.get('notes', id);
  },

  async saveNote(note: Note): Promise<string> {
    const db = await initDB();
    return db.put('notes', note);
  },

  async deleteNote(id: string): Promise<void> {
    const db = await initDB();
    return db.delete('notes', id);
  },

  async clearDatabase(): Promise<void> {
    const db = await initDB();
    return db.clear('notes');
  }
};
