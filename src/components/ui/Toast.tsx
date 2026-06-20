import { useToastStore } from '../../store/toastStore';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export function Toast() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg animate-in slide-in-from-right-full duration-300",
            toast.type === 'success' && "bg-white dark:bg-gray-950 border-green-100 dark:border-green-900/30 text-green-600 dark:text-green-400",
            toast.type === 'error' && "bg-white dark:bg-gray-950 border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400",
            toast.type === 'info' && "bg-white dark:bg-gray-950 border-blue-100 dark:border-blue-900/30 text-blue-600 dark:text-blue-400"
          )}
        >
          {toast.type === 'success' && <CheckCircle2 className="h-5 w-5" />}
          {toast.type === 'error' && <AlertCircle className="h-5 w-5" />}
          {toast.type === 'info' && <Info className="h-5 w-5" />}

          <span className="text-sm font-medium">{toast.message}</span>

          <button
            onClick={() => removeToast(toast.id)}
            className="ml-2 rounded-md p-1 hover:bg-gray-100 dark:hover:bg-gray-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
