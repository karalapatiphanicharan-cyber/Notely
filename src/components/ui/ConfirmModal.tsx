import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onCancel}
      />
      <div
        ref={modalRef}
        className="relative w-full max-w-md scale-95 rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200 dark:border-gray-800 dark:bg-gray-950"
      >
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-900"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{message}</p>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onCancel}
            className="px-6"
          >
            {cancelLabel}
          </Button>
          <Button
            variant="ghost"
            onClick={onConfirm}
            className="bg-red-50 px-6 text-red-600 hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
