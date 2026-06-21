import { useState } from 'react';
import { ChevronDown, ChevronRight, Copy, Check, X } from 'lucide-react';
import { useToastStore } from '../../store/toastStore';

interface CollapsibleCodeBlockProps {
  language: string;
  code: string;
  onDelete?: () => void;
}

export function CollapsibleCodeBlock({ language, code, onDelete }: CollapsibleCodeBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const addToast = useToastStore((state) => state.addToast);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopied(true);
    addToast('Code copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex cursor-pointer items-center justify-between bg-gray-100/50 px-4 py-2.5 transition-colors hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          )}
          <span className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
            {language || 'Code'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          {onDelete && (
             <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="rounded-md p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
              title="Remove code block"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
      {isExpanded && (
        <div className="overflow-x-auto border-t border-gray-100 p-4 dark:border-gray-800">
          <pre className="font-mono text-sm leading-relaxed text-gray-800 dark:text-gray-200">
            <code>{code}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
