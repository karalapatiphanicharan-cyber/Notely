import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Note } from '../types/note';

interface NotelyDB extends DBSchema {
  notes: {
    key: string;
    value: Note;
    indexes: { 'by-updated': number };
  };
}

const DATABASE_NAME = 'notely-db';
const DATABASE_VERSION = 1;

export async function initDB(): Promise<IDBPDatabase<NotelyDB>> {
  return openDB<NotelyDB>(DATABASE_NAME, DATABASE_VERSION, {
    upgrade(db) {
      const store = db.createObjectStore('notes', {
        keyPath: 'id',
      });
      store.createIndex('by-updated', 'updatedAt');
    },
  });
}
