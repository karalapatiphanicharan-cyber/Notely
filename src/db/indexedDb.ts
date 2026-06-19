import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Note } from '../types/note';
import type { Attachment } from '../types/attachment';
import type { TodoList, Task } from '../types/todo';

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
  todoLists: {
    key: string;
    value: TodoList;
    indexes: { 'by-updated': number };
  };
  tasks: {
    key: string;
    value: Task;
    indexes: { 'by-list': string; 'by-updated': number };
  };
}

const DATABASE_NAME = 'notely-db';
const DATABASE_VERSION = 4;

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

      if (oldVersion < 4) {
        if (!db.objectStoreNames.contains('todoLists')) {
          const todoListStore = db.createObjectStore('todoLists', {
            keyPath: 'id',
          });
          todoListStore.createIndex('by-updated', 'updatedAt');
        }
        if (!db.objectStoreNames.contains('tasks')) {
          const taskStore = db.createObjectStore('tasks', {
            keyPath: 'id',
          });
          taskStore.createIndex('by-list', 'listId');
          taskStore.createIndex('by-updated', 'updatedAt');
        }
      }
    },
  });
}
