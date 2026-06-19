import { Plus } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';

export function Home() {
  return (
    <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center">
      <EmptyState
        icon={<Plus className="h-12 w-12" />}
        title="Welcome to Notely"
        subtitle="Capture your thoughts with a clean, distraction-free workspace."
        actionLabel="Create your first note"
        onAction={() => console.log('Create note')}
      />
    </div>
  );
}
