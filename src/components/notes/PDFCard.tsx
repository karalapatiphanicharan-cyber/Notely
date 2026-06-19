import type { Attachment } from '../../types/attachment';
import { FileText, X, ExternalLink } from 'lucide-react';
import { Button } from '../ui/Button';

interface PDFCardProps {
  attachment: Attachment;
  onRemove: (id: string) => void;
}

export function PDFCard({ attachment, onRemove }: PDFCardProps) {
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const openPDF = () => {
    const url = URL.createObjectURL(attachment.data);
    window.open(url, '_blank');
    // We don't revoke here because the tab needs it.
    // It will be cleaned up eventually or when the app reloads.
  };

  return (
    <div className="group relative flex w-64 items-center gap-3 rounded-lg border border-gray-100 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-950 transition-all hover:border-gray-200 dark:hover:border-gray-700">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
        <FileText className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
          {attachment.name}
        </p>
        <p className="text-[10px] text-gray-500 uppercase tracking-wider">
          {formatSize(attachment.size)}
        </p>
      </div>
      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-gray-400 hover:text-gray-600"
          onClick={openPDF}
          title="Open PDF"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-gray-400 hover:text-red-600"
          onClick={() => {
            if (confirm('Are you sure you want to remove this PDF?')) {
              onRemove(attachment.id);
            }
          }}
          title="Remove PDF"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
