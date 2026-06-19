import { NotesList } from '../components/notes/NotesList';
import { NoteEditor } from '../components/notes/NoteEditor';
import { useUIStore } from '../store/uiStore';
import { cn } from '../utils/cn';

export function Home() {
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      <div className={cn(
        "h-full transition-all duration-300",
        "fixed inset-y-16 left-0 z-20 w-80 lg:static lg:block",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:hidden"
      )}>
        <NotesList />
      </div>
      <div className="flex-1 h-full overflow-y-auto">
        <NoteEditor />
      </div>
    </div>
  );
}
