import { initDB } from './indexedDb';
import type { Attachment } from '../types/attachment';

export const attachmentsRepository = {
  async getAttachmentsByNote(noteId: string): Promise<Attachment[]> {
    const db = await initDB();
    return db.getAllFromIndex('attachments', 'by-note', noteId);
  },

  async saveAttachment(attachment: Attachment): Promise<string> {
    const db = await initDB();
    return db.put('attachments', attachment);
  },

  async deleteAttachment(id: string): Promise<void> {
    const db = await initDB();
    return db.delete('attachments', id);
  },

  async deleteAttachmentsByNote(noteId: string): Promise<void> {
    const db = await initDB();
    const attachments = await this.getAttachmentsByNote(noteId);
    const tx = db.transaction('attachments', 'readwrite');
    await Promise.all([
      ...attachments.map(a => tx.store.delete(a.id)),
      tx.done
    ]);
  },

  async getAllAttachments(): Promise<Attachment[]> {
    const db = await initDB();
    return db.getAll('attachments');
  }
};
