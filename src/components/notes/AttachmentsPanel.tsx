import { useRef, useState } from 'react';
import { Plus, EyeOff, Paperclip, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { useNotesStore } from '../../store/notesStore';
import { useUIStore } from '../../store/uiStore';
import { ImageThumbnail } from './ImageThumbnail';
import { PDFCard } from './PDFCard';
import { ImageLightbox } from './ImageLightbox';
import type { Attachment } from '../../types/attachment';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_PDF_TYPE = 'application/pdf';

export function AttachmentsPanel() {
  const { selectedNoteId, selectedNoteAttachments, addAttachment, removeAttachment } = useNotesStore();
  const { privacyMode, isAttachmentsOpen, toggleAttachmentsPanel } = useUIStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [expandedImage, setExpandedImage] = useState<Attachment | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!selectedNoteId) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setError(null);
    for (const file of Array.from(files)) {
      if (file.size > MAX_FILE_SIZE) {
        setError(`File "${file.name}" exceeds the 10MB limit.`);
        continue;
      }

      const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
      const isPDF = file.type === ALLOWED_PDF_TYPE;

      if (!isImage && !isPDF) {
        setError(`File "${file.name}" has an unsupported format.`);
        continue;
      }

      await addAttachment(selectedNoteId, file);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const images = selectedNoteAttachments.filter(a => a.type === 'image');
  const pdfs = selectedNoteAttachments.filter(a => a.type === 'pdf');

  if (!isAttachmentsOpen) {
    return (
      <div className="flex h-full w-12 flex-col items-center border-l border-gray-200 bg-white py-4 dark:border-gray-800 dark:bg-gray-950 transition-all duration-300">
        <Button variant="ghost" size="icon" onClick={toggleAttachmentsPanel} className="mb-4">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Paperclip className="h-5 w-5 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex h-full w-80 flex-col border-l border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 transition-all duration-300 overflow-hidden">
      <div className="p-6 border-b border-gray-100 dark:border-gray-900">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleAttachmentsPanel}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <Paperclip className="h-3 w-3" />
              Attachments
            </h3>
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          multiple
          accept={[...ALLOWED_IMAGE_TYPES, ALLOWED_PDF_TYPE].join(',')}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="w-full justify-center border-dashed border-gray-200 text-gray-500 hover:border-gray-900 hover:text-gray-900 dark:border-gray-800 dark:hover:border-gray-100 dark:hover:text-gray-100"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Attachment
        </Button>

        {error && (
          <p className="mt-2 text-[10px] font-medium text-red-500">{error}</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {privacyMode ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50 py-12 dark:border-gray-800 dark:bg-gray-900/50">
            <EyeOff className="mb-3 h-6 w-6 text-gray-300 dark:text-gray-700" />
            <p className="text-sm font-medium text-gray-400">🔒 Attachments Hidden</p>
          </div>
        ) : (
          <>
            {images.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Images</h4>
                <div className="grid grid-cols-2 gap-3">
                  {images.map((image) => (
                    <ImageThumbnail
                      key={image.id}
                      attachment={image}
                      onRemove={removeAttachment}
                      onExpand={setExpandedImage}
                    />
                  ))}
                </div>
              </div>
            )}

            {pdfs.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Documents</h4>
                <div className="flex flex-col gap-3">
                  {pdfs.map((pdf) => (
                    <div key={pdf.id} className="w-full overflow-hidden">
                      <PDFCard
                        attachment={pdf}
                        onRemove={removeAttachment}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {images.length === 0 && pdfs.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-xs text-gray-400 uppercase tracking-widest">No attachments yet</p>
              </div>
            )}
          </>
        )}
      </div>

      {expandedImage && (
        <ImageLightbox
          attachment={expandedImage}
          onClose={() => setExpandedImage(null)}
        />
      )}
    </div>
  );
}
