import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Note } from '../types/note';
import type { Attachment } from '../types/attachment';

interface NotelyDB extends DBSchema {
  notes: {
    key: string;
    value: Note;
    indexes: { 'by-updated': number };
  };
  attachments: {
    key: string;
    value: Attachment;
    indexes: { 'by-note': string };
  };
}

const DATABASE_NAME = 'notely-db';
const DATABASE_VERSION = 3;

export async function initDB(): Promise<IDBPDatabase<NotelyDB>> {
  return openDB<NotelyDB>(DATABASE_NAME, DATABASE_VERSION, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        const store = db.createObjectStore('notes', {
          keyPath: 'id',
        });
        store.createIndex('by-updated', 'updatedAt');
      }

      if (oldVersion < 3) {
        if (!db.objectStoreNames.contains('attachments')) {
          const attachmentStore = db.createObjectStore('attachments', {
            keyPath: 'id',
          });
          attachmentStore.createIndex('by-note', 'noteId');
        }
      }
    },
  });
}
