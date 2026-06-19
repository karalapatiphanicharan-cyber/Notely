import { useNotesStore } from '../store/notesStore';
import { useUIStore } from '../store/uiStore';
import {
  Info,
  Keyboard,
  BarChart3,
  Database,
  ShieldCheck,
  Smartphone,
  User,
  ExternalLink,
  Copy,
  RotateCw,
  Image as ImageIcon,
  FileText,
  CheckSquare,
  ListTodo
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useState, useEffect } from 'react';
import { attachmentsRepository } from '../db/attachmentsRepository';
import { useTodoStore } from '../store/todoStore';
import { todoRepository } from '../db/todoRepository';

export function Settings() {
  const { notes, loadNotes } = useNotesStore();
  const { theme } = useUIStore();
  const { lists, loadLists } = useTodoStore();
  const [isCopied, setIsCopied] = useState(false);
  const [attachmentStats, setAttachmentStats] = useState({ images: 0, pdfs: 0 });
  const [todoStats, setTodoStats] = useState({ totalTasks: 0, completedTasks: 0, pendingTasks: 0 });

  useEffect(() => {
    loadLists();
  }, [loadLists]);

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

    const fetchTodoStats = async () => {
      try {
        const allTasks = await todoRepository.getAllTasks();
        setTodoStats({
          totalTasks: allTasks.length,
          completedTasks: allTasks.filter(t => t.isCompleted).length,
          pendingTasks: allTasks.filter(t => !t.isCompleted).length,
        });
      } catch (error) {
        console.error('Failed to fetch todo stats:', error);
      }
    };
    fetchTodoStats();
  }, []);

  // Derive isPWA from window matchMedia if available, otherwise default to false
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
    navigator.clipboard.writeText('v6.0');
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-4xl p-6 lg:p-12 space-y-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your application preferences and view system information.</p>
      </header>

      <div className="grid gap-8 md:grid-cols-2">
        {/* General Information */}
        <section className="space-y-4 rounded-xl border border-gray-100 p-6 dark:border-gray-900 bg-white dark:bg-gray-950 shadow-sm">
          <div className="flex items-center gap-3 text-gray-900 dark:text-gray-100">
            <Info className="h-5 w-5 text-gray-400" />
            <h2 className="font-semibold">General Information</h2>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-900/50">
              <span className="text-gray-500">Application Name</span>
              <span className="font-medium">Notely</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-900/50 items-center">
              <span className="text-gray-500">Version</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-400">v6.0</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyVersion} title="Copy version">
                  <Copy className={`h-3 w-3 ${isCopied ? 'text-green-500' : ''}`} />
                </Button>
              </div>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-900/50">
              <span className="text-gray-500">Theme</span>
              <span className="font-medium capitalize">{theme}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500">Local Data</span>
              <span className="font-medium text-green-600 dark:text-green-400">On-device only</span>
            </div>
          </div>
        </section>

        {/* Productivity Statistics */}
        <section className="space-y-4 rounded-xl border border-gray-100 p-6 dark:border-gray-900 bg-white dark:bg-gray-950 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-gray-900 dark:text-gray-100">
              <BarChart3 className="h-5 w-5 text-gray-400" />
              <h2 className="font-semibold">Productivity Statistics</h2>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => loadNotes()} title="Refresh statistics">
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2">
            {[
              { label: 'Total', value: stats.total },
              { label: 'Active', value: stats.active },
              { label: 'Favorites', value: stats.favorites },
              { label: 'Pinned', value: stats.pinned },
              { label: 'Archived', value: stats.archived },
              { label: 'Trashed', value: stats.trashed },
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900/50">
                <div className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</div>
                <div className="text-xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-4 border-t border-gray-100 pt-6 dark:border-gray-900">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
              Attachments
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white p-3 dark:border-gray-900 dark:bg-gray-950">
                <div className="rounded-md bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                  <ImageIcon className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 uppercase">Images</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{attachmentStats.images}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white p-3 dark:border-gray-900 dark:bg-gray-950">
                <div className="rounded-md bg-red-50 p-2 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 uppercase">PDFs</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{attachmentStats.pdfs}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4 border-t border-gray-100 pt-6 dark:border-gray-900">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
              To-Do Statistics
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white p-3 dark:border-gray-900 dark:bg-gray-950">
                <div className="rounded-md bg-purple-50 p-2 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                  <ListTodo className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 uppercase">Lists</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{lists.length}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white p-3 dark:border-gray-900 dark:bg-gray-950">
                <div className="rounded-md bg-green-50 p-2 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                  <CheckSquare className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 uppercase">Tasks</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{todoStats.totalTasks}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white p-3 dark:border-gray-900 dark:bg-gray-950">
                <div className="rounded-md bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                  <CheckSquare className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 uppercase">Completed</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{todoStats.completedTasks}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white p-3 dark:border-gray-900 dark:bg-gray-950">
                <div className="rounded-md bg-amber-50 p-2 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                  <CheckSquare className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 uppercase">Pending</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{todoStats.pendingTasks}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Keyboard Shortcuts */}
        <section className="md:col-span-2 space-y-4 rounded-xl border border-gray-100 p-6 dark:border-gray-900 bg-white dark:bg-gray-950 shadow-sm">
          <div className="flex items-center gap-3 text-gray-900 dark:text-gray-100">
            <Keyboard className="h-5 w-5 text-gray-400" />
            <h2 className="font-semibold">Keyboard Shortcuts</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase border-b border-gray-50 dark:border-gray-900">
                <tr>
                  <th className="py-2 px-4 font-medium">Shortcut</th>
                  <th className="py-2 px-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-900">
                {[
                  { keys: 'Ctrl/Cmd + N', action: 'Create New Note' },
                  { keys: 'Alt + N', action: 'Create New Note' },
                  { keys: 'Ctrl/Cmd + F', action: 'Focus Search' },
                  { keys: 'Ctrl/Cmd + Shift + P', action: 'Toggle Privacy Mode' },
                  { keys: 'Escape', action: 'Close dialogs or overlays' },
                ].map((shortcut) => (
                  <tr key={shortcut.keys} className="group hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-blue-600 dark:text-blue-400">{shortcut.keys}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{shortcut.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-gray-400 italic mt-4 px-4">
            "Some browser-reserved shortcuts (such as Ctrl/Cmd + N) cannot be overridden consistently."
          </p>
        </section>

        {/* Storage & PWA */}
        <section className="space-y-6">
          <div className="rounded-xl border border-gray-100 p-6 dark:border-gray-900 bg-white dark:bg-gray-950 shadow-sm space-y-4">
            <div className="flex items-center gap-3 text-gray-900 dark:text-gray-100">
              <Database className="h-5 w-5 text-gray-400" />
              <h2 className="font-semibold">Storage Information</h2>
            </div>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Storage Type</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">IndexedDB</span>
              </div>
              <div className="flex justify-between">
                <span>Auto Save</span>
                <span className="font-medium text-green-600 dark:text-green-400">Enabled</span>
              </div>
              <div className="flex justify-between">
                <span>Persistence</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">Automatic</span>
              </div>
              <div className="flex justify-between">
                <span>Cloud Sync</span>
                <span className="font-medium text-gray-400">Not Configured</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 p-6 dark:border-gray-900 bg-white dark:bg-gray-950 shadow-sm space-y-4">
            <div className="flex items-center gap-3 text-gray-900 dark:text-gray-100">
              <Smartphone className="h-5 w-5 text-gray-400" />
              <h2 className="font-semibold">Progressive Web App</h2>
            </div>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex justify-between items-center">
                <span>Status</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${isPWA ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                  {isPWA ? 'Installed' : 'Running in Browser'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Offline Support</span>
                <span className="font-medium text-green-600 dark:text-green-400">Enabled</span>
              </div>
              <div className="flex justify-between">
                <span>Cached Assets</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">Active</span>
              </div>
            </div>
          </div>
        </section>

        {/* Privacy & About */}
        <section className="space-y-6">
          <div className="rounded-xl border border-gray-100 p-6 dark:border-gray-900 bg-white dark:bg-gray-950 shadow-sm space-y-4">
            <div className="flex items-center gap-3 text-gray-900 dark:text-gray-100">
              <ShieldCheck className="h-5 w-5 text-gray-400" />
              <h2 className="font-semibold">Privacy Information</h2>
            </div>
            <div className="space-y-3 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
              <p>• Notes are stored locally on your device's IndexedDB storage.</p>
              <p>• Privacy Mode hides note content on screen for visual concealment.</p>
              <p>• Content is only visually obscured and is not encrypted.</p>
              <p>• Data remains on your device and is never uploaded to any server.</p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 p-6 dark:border-gray-900 bg-white dark:bg-gray-950 shadow-sm space-y-4">
            <div className="flex items-center gap-3 text-gray-900 dark:text-gray-100">
              <User className="h-5 w-5 text-gray-400" />
              <h2 className="font-semibold">Developer Information</h2>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-[10px] uppercase text-gray-400 tracking-widest font-bold mb-2">Built With</div>
                <div className="flex flex-wrap gap-2">
                  {['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Zustand', 'IndexedDB', 'PWA'].map(tech => (
                    <span key={tech} className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-900 text-[10px] font-medium text-gray-600 dark:text-gray-300">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* About Section */}
      <footer className="border-t border-gray-100 dark:border-gray-900 pt-12 text-center space-y-6 pb-12">
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">About Notely</h2>
          <p className="mx-auto max-w-lg text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Minimalist offline-first note-taking application built for fast, private, and reliable local note management.
          </p>
        </div>
        <div className="flex justify-center gap-4">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <ExternalLink className="mr-2 h-3.5 w-3.5" />
            Repository
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <ExternalLink className="mr-2 h-3.5 w-3.5" />
            Documentation
          </Button>
        </div>
        <div className="text-[10px] text-gray-400 uppercase tracking-widest">
          &copy; {new Date().getFullYear()} Notely &bull; All Rights Reserved
        </div>
      </footer>
    </div>
  );
}
