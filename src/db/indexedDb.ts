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
const DATABASE_VERSION = 2;

export async function initDB(): Promise<IDBPDatabase<NotelyDB>> {
  return openDB<NotelyDB>(DATABASE_NAME, DATABASE_VERSION, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        const store = db.createObjectStore('notes', {
          keyPath: 'id',
        });
        store.createIndex('by-updated', 'updatedAt');
      }

      if (oldVersion < 2) {
        // Migration will be handled by the store when loading if needed,
        // or we can iterate here using transaction.objectStore('notes').
      }
    },
  });
}
