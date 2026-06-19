import type { ReactNode } from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  subtitle: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  subtitle,
  icon,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && <div className="mb-4 text-gray-400">{icon}</div>}
      <h3 className="mb-2 text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
        {title}
      </h3>
      <p className="mb-8 max-w-sm text-gray-500 dark:text-gray-400">
        {subtitle}
      </p>
      {actionLabel && (
        <Button size="lg" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
