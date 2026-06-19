import { type ReactNode } from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
      {icon && <div className="mb-6 text-gray-300 dark:text-gray-700">{icon}</div>}
      <h3 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
        {title}
      </h3>
      <p className="mb-8 max-w-sm text-gray-500 dark:text-gray-400">
        {description}
      </p>
      {actionLabel && (
        <Button onClick={onAction} size="lg" className="rounded-full shadow-lg shadow-gray-200 dark:shadow-none">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
