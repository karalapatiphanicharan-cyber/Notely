import { FilePlus } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';

export function Home() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <EmptyState
        title="Welcome to Notely"
        description="Capture your thoughts with a clean, distraction-free workspace."
        icon={<FilePlus className="h-16 w-16 stroke-[1]" />}
        actionLabel="+ Create your first note"
        onAction={() => console.log('Create note clicked')}
      />
    </div>
  );
}
