import { NotesList } from '../components/notes/NotesList';
import { NoteEditor } from '../components/notes/NoteEditor';
import { AttachmentSection } from '../components/notes/AttachmentSection';
import { AttachmentsPanel } from '../components/notes/AttachmentsPanel';
import { useUIStore } from '../store/uiStore';
import { cn } from '../utils/cn';

export function Home() {
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      <div className={cn(
        "h-full transition-all duration-300 shrink-0",
        "fixed inset-y-16 left-0 z-20 lg:static lg:block",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:hidden"
      )}>
        <NotesList />
      </div>
      <div className="flex-1 h-full overflow-hidden flex flex-col min-w-0">
        <div className="flex-1 overflow-y-auto">
          <NoteEditor />
          <div className="lg:hidden px-8 pb-12">
            <AttachmentSection />
          </div>
        </div>
      </div>
      <div className="h-full shrink-0 hidden lg:block">
        <AttachmentsPanel />
      </div>
    </div>
  );
}
