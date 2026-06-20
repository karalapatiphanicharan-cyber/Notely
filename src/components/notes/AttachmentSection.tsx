import { useRef, useState, useEffect } from 'react';
import { Plus, EyeOff } from 'lucide-react';
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

export function AttachmentSection() {
  const { selectedNoteId, selectedNoteAttachments, addAttachment, removeAttachment } = useNotesStore();
  const privacyMode = useUIStore((state) => state.privacyMode);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [expandedImage, setExpandedImage] = useState<Attachment | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Reset transient UI state when switching notes
  useEffect(() => {
    const timeout = setTimeout(() => {
      setExpandedImage(null);
      setError(null);
    }, 0);
    return () => clearTimeout(timeout);
  }, [selectedNoteId]);

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

  return (
    <div className="mt-12 space-y-6 border-t border-gray-100 pt-8 dark:border-gray-900">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Attachments</h3>
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            multiple
            accept={[...ALLOWED_IMAGE_TYPES, ALLOWED_PDF_TYPE].join(',')}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add File
          </Button>
        </div>
      </div>

      {error && (
        <p className="text-xs font-medium text-red-500">{error}</p>
      )}

      {privacyMode ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50 py-8 dark:border-gray-800 dark:bg-gray-900/50">
          <EyeOff className="mb-2 h-6 w-6 text-gray-300 dark:text-gray-700" />
          <p className="text-sm font-medium text-gray-400">🔒 Attachments Hidden</p>
        </div>
      ) : (
        <div className="space-y-6">
          {(images.length > 0 || pdfs.length > 0) ? (
            <>
              {images.length > 0 && (
                <div className="flex flex-wrap gap-4">
                  {images.map((image) => (
                    <ImageThumbnail
                      key={image.id}
                      attachment={image}
                      onRemove={removeAttachment}
                      onExpand={setExpandedImage}
                    />
                  ))}
                </div>
              )}

              {pdfs.length > 0 && (
                <div className="flex flex-wrap gap-4">
                  {pdfs.map((pdf) => (
                    <PDFCard
                      key={pdf.id}
                      attachment={pdf}
                      onRemove={removeAttachment}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-100 bg-gray-50/30 py-8 text-center dark:border-gray-900 dark:bg-gray-950/30">
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-widest mb-1">No attachments</p>
              <p className="text-xs text-gray-400 uppercase tracking-widest">Add images or PDFs to this note.</p>
            </div>
          )}
        </div>
      )}

      {expandedImage && (
        <ImageLightbox
          attachment={expandedImage}
          onClose={() => setExpandedImage(null)}
        />
      )}
    </div>
  );
}
