import { useState, useEffect } from 'react';
import type { Attachment } from '../../types/attachment';
import { X, Maximize2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { ConfirmModal } from '../ui/ConfirmModal';

interface ImageThumbnailProps {
  attachment: Attachment;
  onRemove: (id: string) => void;
  onExpand: (attachment: Attachment) => void;
}

export function ImageThumbnail({ attachment, onRemove, onExpand }: ImageThumbnailProps) {
  const [url, setUrl] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(attachment.data);
    const timeout = setTimeout(() => {
      setUrl(objectUrl);
    }, 0);
    return () => {
      clearTimeout(timeout);
      URL.revokeObjectURL(objectUrl);
    };
  }, [attachment.data]);

  return (
    <div className="group relative aspect-square w-24 overflow-hidden rounded-lg border border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
      {url && (
        <img
          src={url}
          alt={attachment.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      )}
      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 bg-white/90 text-gray-900 hover:bg-white dark:bg-gray-900/90 dark:text-gray-100"
            onClick={() => onExpand(attachment)}
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 bg-white/90 text-red-600 hover:bg-white hover:text-red-700 dark:bg-gray-900/90 dark:text-red-400"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Image?"
        message="Are you sure you want to permanently remove this image?"
        onConfirm={() => {
          onRemove(attachment.id);
          setShowDeleteConfirm(false);
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
