import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';

interface LinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (displayText: string, url: string) => void;
}

export function LinkModal({ isOpen, onClose, onInsert }: LinkModalProps) {
  const [displayText, setDisplayText] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleInsert = () => {
    let finalUrl = url.trim();
    if (finalUrl && !/^https?:\/\//i.test(finalUrl)) {
      finalUrl = 'https://' + finalUrl;
    }

    // Basic URL validation
    try {
      new URL(finalUrl);
      onInsert(displayText.trim() || finalUrl, finalUrl);
      setDisplayText('');
      setUrl('');
      setError('');
      onClose();
    } catch {
      setError('Please enter a valid URL');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md scale-95 rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200 dark:border-gray-800 dark:bg-gray-950">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-900"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Insert Link</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Add a hyperlink to your note.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Display Text</label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-800 dark:bg-gray-900"
              placeholder="e.g. Google"
              value={displayText}
              onChange={(e) => setDisplayText(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">URL</label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-800 dark:bg-gray-900"
              placeholder="e.g. google.com"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError('');
              }}
            />
            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleInsert} disabled={!url.trim()}>
            Insert
          </Button>
        </div>
      </div>
    </div>
  );
}
