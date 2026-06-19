export type AttachmentType = 'image' | 'pdf';

export interface Attachment {
  id: string;
  noteId: string;
  type: AttachmentType;
  name: string;
  size: number;
  mimeType: string;
  data: Blob;
  createdAt: number;
}
