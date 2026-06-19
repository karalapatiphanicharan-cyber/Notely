import { useState, useEffect } from 'react';
import type { Attachment } from '../../types/attachment';
import { X, Download } from 'lucide-react';
import { Button } from '../ui/Button';

interface ImageLightboxProps {
  attachment: Attachment;
  onClose: () => void;
}

export function ImageLightbox({ attachment, onClose }: ImageLightboxProps) {
  const [url, setUrl] = useState<string>('');

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

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = url;
    a.download = attachment.name;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute top-4 right-4 flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full bg-white/10 text-white hover:bg-white/20"
          onClick={handleDownload}
          title="Download image"
        >
          <Download className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full bg-white/10 text-white hover:bg-white/20"
          onClick={onClose}
          title="Close preview"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      <div className="relative max-h-full max-w-full">
        {url && (
          <img
            src={url}
            alt={attachment.name}
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
          />
        )}
        <div className="mt-4 text-center">
          <p className="text-sm font-medium text-white">{attachment.name}</p>
        </div>
      </div>
    </div>
  );
}
