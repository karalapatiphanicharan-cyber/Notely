import { useNotesStore } from '../store/notesStore';
import { useUIStore } from '../store/uiStore';
import {
  Info,
  Keyboard,
  Database,
  ShieldCheck,
  Smartphone,
  ExternalLink,
  Copy,
  Type,
  Paperclip,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useState, useEffect } from 'react';
import type { ReactNode, ElementType } from 'react';
import { attachmentsRepository } from '../db/attachmentsRepository';
import { cn } from '../utils/cn';

interface CardProps {
  title: string;
  icon: ElementType;
  children: ReactNode;
  className?: string;
}

function Card({ title, icon: Icon, children, className }: CardProps) {
  return (
    <section className={cn("space-y-4 rounded-xl border border-gray-100 p-6 dark:border-gray-900 bg-white dark:bg-gray-950 shadow-sm", className)}>
      <div className="flex items-center gap-3 text-gray-900 dark:text-gray-100">
        <Icon className="h-5 w-5 text-gray-400" />
        <h2 className="font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export function Settings() {
  const { notes } = useNotesStore();
  const { theme, setTheme } = useUIStore();
  const [isCopied, setIsCopied] = useState(false);
  const [attachmentStats, setAttachmentStats] = useState({ images: 0, pdfs: 0 });

  useEffect(() => {
    const fetchAttachmentStats = async () => {
      try {
        const allAttachments = await attachmentsRepository.getAllAttachments();
        setAttachmentStats({
          images: allAttachments.filter(a => a.type === 'image').length,
          pdfs: allAttachments.filter(a => a.type === 'pdf').length,
        });
      } catch (error) {
        console.error('Failed to fetch attachment stats:', error);
      }
    };
    fetchAttachmentStats();
  }, []);

  const isPWA = typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches;

  const stats = {
    total: notes.length,
    active: notes.filter(n => !n.isArchived && !n.isTrashed).length,
    favorites: notes.filter(n => n.isFavorite && !n.isTrashed).length,
    pinned: notes.filter(n => n.isPinned && !n.isTrashed).length,
    archived: notes.filter(n => n.isArchived && !n.isTrashed).length,
    trashed: notes.filter(n => n.isTrashed).length,
  };

  const copyVersion = () => {
    navigator.clipboard.writeText('v8.0');
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-4xl p-6 lg:p-12 space-y-12 pb-24">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your application preferences and view system information.</p>
      </header>

      <div className="grid gap-8 md:grid-cols-2">
        <Card title="Application" icon={Info}>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-900/50">
              <span className="text-gray-500">Name</span>
              <span className="font-medium">Notely</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-900/50">
              <span className="text-gray-500">Description</span>
              <span className="font-medium">Minimalist Offline Notes</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-900/50 items-center">
              <span className="text-gray-500">Version</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-400">v8.0</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyVersion}>
                  <Copy className={cn("h-3 w-3", isCopied && "text-green-500")} />
                </Button>
              </div>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500">Status</span>
              <span className="font-medium text-green-600 dark:text-green-400">Offline-first</span>
            </div>
          </div>
        </Card>

        <Card title="Appearance" icon={Monitor}>
          <div className="flex items-center gap-1 p-1 bg-gray-50 dark:bg-gray-900 rounded-lg">
            {[
              { value: 'light', icon: Sun, label: 'Light' },
              { value: 'dark', icon: Moon, label: 'Dark' },
              { value: 'system', icon: Monitor, label: 'System' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setTheme(option.value as 'light' | 'dark' | 'system')}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-xs font-medium transition-all",
                  theme === option.value
                    ? "bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-gray-100"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                )}
              >
                <option.icon className="h-3.5 w-3.5" />
                {option.label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 text-center mt-2 uppercase tracking-widest font-bold">
            Choose your preferred color mode
          </p>
        </Card>

        <Card title="Keyboard Shortcuts" icon={Keyboard} className="md:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { keys: 'Ctrl/Cmd + N', action: 'New Note' },
              { keys: 'Alt + N', action: 'New Note' },
              { keys: 'Ctrl/Cmd + F', action: 'Focus Search' },
              { keys: 'Ctrl/Cmd + Shift + P', action: 'Toggle Privacy' },
              { keys: 'Escape', action: 'Close dialogs' },
              { keys: 'Ctrl/Cmd + Z / Y', action: 'Undo / Redo' },
            ].map((s) => (
              <div key={s.keys} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                <span className="text-xs text-gray-600 dark:text-gray-300">{s.action}</span>
                <kbd className="px-2 py-1 rounded border border-gray-200 bg-white font-mono text-[10px] text-blue-600 dark:border-gray-800 dark:bg-gray-950 dark:text-blue-400">
                  {s.keys}
                </kbd>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Privacy" icon={ShieldCheck}>
          <div className="space-y-4 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
            <p>
              <strong className="text-gray-900 dark:text-gray-100">Privacy Mode:</strong> When enabled, the editor content and attachments are obscured behind an overlay for visual concealment.
            </p>
            <p>
              <strong className="text-gray-900 dark:text-gray-100">Local Only:</strong> Your notes and attachments are stored exclusively in your browser's IndexedDB. We never upload your data to any cloud servers.
            </p>
            <p>
              <strong className="text-gray-900 dark:text-gray-100">Visual Guard:</strong> Privacy mode is a visual feature only and does not involve data encryption.
            </p>
          </div>
        </Card>

        <Card title="Storage" icon={Database}>
          <div className="space-y-3">
            <div className="flex items-center justify-between pt-1">
              <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Local Repository</div>
              <div className="text-xs font-bold text-gray-900 dark:text-gray-100">IndexedDB</div>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="rounded-lg bg-gray-50 p-2 text-center dark:bg-gray-900/50">
                <div className="text-[10px] text-gray-400 uppercase">Notes</div>
                <div className="text-sm font-bold">{stats.total}</div>
              </div>
              <div className="rounded-lg bg-gray-50 p-2 text-center dark:bg-gray-900/50">
                <div className="text-[10px] text-gray-400 uppercase">Images</div>
                <div className="text-sm font-bold">{attachmentStats.images}</div>
              </div>
              <div className="rounded-lg bg-gray-50 p-2 text-center dark:bg-gray-900/50">
                <div className="text-[10px] text-gray-400 uppercase">PDFs</div>
                <div className="text-sm font-bold">{attachmentStats.pdfs}</div>
              </div>
            </div>
            <div className="flex justify-between py-1 text-xs">
              <span className="text-gray-500">Auto-save Status</span>
              <span className="font-medium text-green-600 dark:text-green-400 flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Enabled
              </span>
            </div>
          </div>
        </Card>

        <Card title="Rich Text Formatting" icon={Type}>
          <div className="grid grid-cols-2 gap-2">
            {[
              'Bold & Italic',
              'Underline',
              'Lists (Bullet/Order)',
              'Headings (H1-H3)',
              'Blockquotes',
              'Hyperlinks',
              'Inline Code',
              'Code Blocks'
            ].map(f => (
              <div key={f} className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                <div className="h-1 w-1 rounded-full bg-gray-300" />
                {f}
              </div>
            ))}
          </div>
        </Card>

        <Card title="Attachments" icon={Paperclip}>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {['JPG', 'JPEG', 'PNG', 'GIF', 'WEBP'].map(ext => (
                <span key={ext} className="px-2 py-1 rounded bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 text-[10px] font-bold">
                  {ext}
                </span>
              ))}
              <span className="px-2 py-1 rounded bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 text-[10px] font-bold">
                PDF
              </span>
            </div>
            <p className="text-[10px] text-gray-400 italic">
              "Supports multiple attachments per note with a 10MB per-file limit."
            </p>
          </div>
        </Card>

        <Card title="Progressive Web App" icon={Smartphone} className="md:col-span-2">
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="space-y-1">
              <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">PWA Status</div>
              <div className={cn(
                "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                isPWA ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
              )}>
                {isPWA ? 'Installed' : 'In-Browser'}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Offline Capacity</div>
              <div className="text-xs font-medium text-green-600 dark:text-green-400">Fully Supported</div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Cached Assets</div>
              <div className="text-xs font-medium text-gray-900 dark:text-gray-100">Enabled (Vite-PWA)</div>
            </div>
          </div>
        </Card>
      </div>

      <footer className="border-t border-gray-100 dark:border-gray-900 pt-12 text-center space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">About Notely</h2>
          <p className="mx-auto max-w-lg text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Notely is a minimalist, professional offline-first note-taking application designed for individuals who value speed, privacy, and simplicity. Built with modern web technologies, it works everywhere—online or offline.
          </p>
        </div>
        <div className="flex justify-center gap-4">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <ExternalLink className="mr-2 h-3.5 w-3.5" />
            Repository
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <ExternalLink className="mr-2 h-3.5 w-3.5" />
            Support
          </Button>
        </div>
        <div className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">
          &copy; {new Date().getFullYear()} Notely &bull; Privacy First
        </div>
      </footer>
    </div>
  );
}
