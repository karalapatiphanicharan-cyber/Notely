import { useNotesStore } from '../store/notesStore';
import { useUIStore } from '../store/uiStore';
import {
  Info,
  Keyboard,
  BarChart3,
  Database,
  Smartphone,
  User,
  ExternalLink,
  Copy,
  RotateCw,
  Image as ImageIcon,
  FileText,
  CheckSquare,
  ListTodo,
  Globe,
  Trash2,
  Settings2,
  RefreshCw,
  Monitor,
  Shield,
  ShieldCheck,
  Zap,
  Star,
  Archive,
  Pin
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useState, useEffect } from 'react';
import { attachmentsRepository } from '../db/attachmentsRepository';
import { useTodoStore } from '../store/todoStore';
import { todoRepository } from '../db/todoRepository';
import { cn } from '../utils/cn';
import { ConfirmModal } from '../components/ui/ConfirmModal';

export function Settings() {
  const { notes, loadNotes } = useNotesStore();
  const { theme, setTheme } = useUIStore();
  const { lists, loadLists } = useTodoStore();
  const [isCopied, setIsCopied] = useState(false);
  const [attachmentStats, setAttachmentStats] = useState({ images: 0, pdfs: 0 });
  const [todoStats, setTodoStats] = useState({ totalTasks: 0, completedTasks: 0, pendingTasks: 0 });
  const [storageEstimate, setStorageEstimate] = useState<{ used: string, total: string, percent: number } | null>(null);
  const [showClearCacheConfirm, setShowClearCacheConfirm] = useState(false);
  const [showResetSettingsConfirm, setShowResetSettingsConfirm] = useState(false);
  const [lastUpdated] = useState(new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));

  useEffect(() => {
    loadLists();
  }, [loadLists]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const allAttachments = await attachmentsRepository.getAllAttachments();
        setAttachmentStats({
          images: allAttachments.filter(a => a.type === 'image').length,
          pdfs: allAttachments.filter(a => a.type === 'pdf').length,
        });

        const allTasks = await todoRepository.getAllTasks();
        setTodoStats({
          totalTasks: allTasks.length,
          completedTasks: allTasks.filter(t => t.isCompleted).length,
          pendingTasks: allTasks.filter(t => !t.isCompleted).length,
        });

        if ('storage' in navigator && 'estimate' in navigator.storage) {
          const { usage, quota } = await navigator.storage.estimate();
          if (usage !== undefined && quota !== undefined) {
            setStorageEstimate({
              used: (usage / (1024 * 1024)).toFixed(1) + ' MB',
              total: (quota / (1024 * 1024 * 1024)).toFixed(1) + ' GB',
              percent: Math.round((usage / quota) * 100)
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch settings stats:', error);
      }
    };
    fetchStats();
  }, []);

  const isPWA = typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches;
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  const stats = {
    total: notes.length,
    active: notes.filter(n => !n.isArchived && !n.isTrashed).length,
    favorites: notes.filter(n => n.isFavorite && !n.isTrashed).length,
    pinned: notes.filter(n => n.isPinned && !n.isTrashed).length,
    archived: notes.filter(n => n.isArchived && !n.isTrashed).length,
    trashed: notes.filter(n => n.isTrashed).length,
  };

  const copyVersion = () => {
    navigator.clipboard.writeText('v6.1');
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleClearCache = async () => {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
    }
    const cacheKeys = await caches.keys();
    for (const key of cacheKeys) {
      await caches.delete(key);
    }
    setShowClearCacheConfirm(false);
    window.location.reload();
  };

  const handleResetSettings = () => {
    localStorage.removeItem('notely-ui-storage');
    setShowResetSettingsConfirm(false);
    window.location.reload();
  };

  return (
    <div className="mx-auto max-w-5xl p-6 lg:p-12 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-gray-100">Settings</h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">Manage your application preferences and view detailed system information.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-bold text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 self-start sm:self-auto">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            System Healthy
          </div>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* General Information */}
        <section className="group space-y-6 rounded-2xl border border-gray-100 p-8 dark:border-gray-900 bg-white dark:bg-gray-950 shadow-sm transition-all hover:shadow-md hover:border-gray-200 dark:hover:border-gray-800">
          <div className="flex items-center gap-3 text-gray-900 dark:text-gray-100">
            <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
              <Info className="h-5 w-5" />
            </div>
            <h2 className="font-bold">General Information</h2>
          </div>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center py-1 border-b border-gray-50 dark:border-gray-800/50">
              <span className="text-gray-500">App Name</span>
              <span className="font-bold text-gray-900 dark:text-gray-100">Notely</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-gray-50 dark:border-gray-800/50">
              <span className="text-gray-500">Version</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-medium text-gray-400">v6.1</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyVersion} title="Copy version">
                  <Copy className={cn("h-3 w-3 transition-colors", isCopied ? 'text-emerald-500' : '')} />
                </Button>
              </div>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-gray-50 dark:border-gray-800/50">
              <span className="text-gray-500">Status</span>
              <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider", isOnline ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400')}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-gray-50 dark:border-gray-800/50">
              <span className="text-gray-500">Last Updated</span>
              <span className="font-medium">{lastUpdated}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-gray-50 dark:border-gray-800/50">
              <span className="text-gray-500">Theme</span>
              <div className="flex items-center gap-1">
                 <select
                   value={theme}
                   onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
                   className="bg-transparent border-none text-xs font-bold focus:ring-0 cursor-pointer capitalize appearance-none text-right"
                 >
                   <option value="light">Light</option>
                   <option value="dark">Dark</option>
                   <option value="system">System</option>
                 </select>
                 <span className="text-[8px]">▼</span>
              </div>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-500">Compatibility</span>
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Modern Browsers</span>
            </div>
          </div>
        </section>

        {/* Storage Information */}
        <section className="group space-y-6 rounded-2xl border border-gray-100 p-8 dark:border-gray-900 bg-white dark:bg-gray-950 shadow-sm transition-all hover:shadow-md hover:border-gray-200 dark:hover:border-gray-800">
          <div className="flex items-center gap-3 text-gray-900 dark:text-gray-100">
            <div className="rounded-lg bg-amber-50 p-2 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
              <Database className="h-5 w-5" />
            </div>
            <h2 className="font-bold">Storage & Data</h2>
          </div>
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Storage Used</span>
                <span className="font-bold text-gray-900 dark:text-gray-100">{storageEstimate?.used || 'Calculating...'}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all duration-1000 ease-out"
                  style={{ width: `${storageEstimate?.percent || 0}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>0 MB</span>
                <span>Limit: {storageEstimate?.total || '...'}</span>
              </div>
            </div>
            <div className="space-y-3 text-sm pt-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Engine</span>
                <span className="font-bold">IndexedDB</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Offline Cache</span>
                <span className="font-bold text-emerald-500">Enabled</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Attachments</span>
                <span className="font-bold">Supported</span>
              </div>
            </div>
          </div>
        </section>

        {/* PWA Support */}
        <section className="group space-y-6 rounded-2xl border border-gray-100 p-8 dark:border-gray-900 bg-white dark:bg-gray-950 shadow-sm transition-all hover:shadow-md hover:border-gray-200 dark:hover:border-gray-800">
          <div className="flex items-center gap-3 text-gray-900 dark:text-gray-100">
            <div className="rounded-lg bg-purple-50 p-2 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
              <Smartphone className="h-5 w-5" />
            </div>
            <h2 className="font-bold">Web Application</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4 dark:bg-gray-900/50">
              <span className="text-sm text-gray-500">Install Status</span>
              <span className={cn("px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest", isPWA ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400')}>
                {isPWA ? 'Installed' : 'Standalone Available'}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {[
                { label: 'Offline Ready', icon: <Globe className="h-3 w-3" />, value: true },
                { label: 'Cached Assets', icon: <Zap className="h-3 w-3" />, value: true },
                { label: 'Service Worker', icon: <Monitor className="h-3 w-3" />, value: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2 px-1">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  <span className="text-emerald-500 font-bold">✅</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Productivity Statistics Dashboard */}
        <section className="md:col-span-2 lg:col-span-3 space-y-6 rounded-2xl border border-gray-100 p-8 dark:border-gray-900 bg-white dark:bg-gray-950 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-gray-900 dark:text-gray-100">
              <div className="rounded-lg bg-emerald-50 p-2 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h2 className="font-bold">Productivity Statistics</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-emerald-500"
              onClick={() => {
                loadNotes();
                loadLists();
              }}
            >
              <RefreshCw className="mr-2 h-3 w-3" />
              Refresh
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { label: 'Total Notes', value: stats.total, icon: <FileText className="h-4 w-4" />, color: 'bg-blue-50 text-blue-600' },
              { label: 'Favorites', value: stats.favorites, icon: <Star className="h-4 w-4" />, color: 'bg-yellow-50 text-yellow-600' },
              { label: 'Archived', value: stats.archived, icon: <Archive className="h-4 w-4" />, color: 'bg-purple-50 text-purple-600' },
              { label: 'Trash', value: stats.trashed, icon: <Trash2 className="h-4 w-4" />, color: 'bg-red-50 text-red-600' },
              { label: 'Pinned', value: stats.pinned, icon: <Pin className="h-4 w-4" />, color: 'bg-emerald-50 text-emerald-600' },
            ].map((stat) => (
              <div key={stat.label} className="group relative overflow-hidden rounded-2xl border border-gray-50 bg-gray-50/50 p-5 dark:border-gray-900/50 dark:bg-gray-900/30 transition-all hover:bg-white dark:hover:bg-gray-900 hover:shadow-sm">
                <div className={cn("mb-3 inline-flex rounded-lg p-2 dark:bg-opacity-20", stat.color)}>
                  {stat.icon}
                </div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</div>
                <div className="text-2xl font-black text-gray-900 dark:text-gray-100 tabular-nums animate-in zoom-in-50 duration-500">{stat.value}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Images', value: attachmentStats.images, icon: <ImageIcon className="h-4 w-4" />, color: 'text-sky-500' },
              { label: 'PDFs', value: attachmentStats.pdfs, icon: <FileText className="h-4 w-4" />, color: 'text-rose-500' },
              { label: 'To-Do Lists', value: lists.length, icon: <ListTodo className="h-4 w-4" />, color: 'text-indigo-500' },
              { label: 'Pending Tasks', value: todoStats.pendingTasks, icon: <CheckSquare className="h-4 w-4" />, color: 'text-amber-500' },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 dark:border-gray-900 dark:bg-gray-950/50">
                <div className={cn("rounded-full p-2.5 bg-opacity-10", stat.color.replace('text', 'bg'))}>
                  <div className={stat.color}>{stat.icon}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</div>
                  <div className="text-xl font-black text-gray-900 dark:text-gray-100">{stat.value}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Keyboard Shortcuts Modern Table */}
        <section className="md:col-span-2 lg:col-span-2 space-y-6 rounded-2xl border border-gray-100 p-8 dark:border-gray-900 bg-white dark:bg-gray-950 shadow-sm">
          <div className="flex items-center gap-3 text-gray-900 dark:text-gray-100">
            <div className="rounded-lg bg-gray-50 p-2 dark:bg-gray-900 text-gray-600 dark:text-gray-400">
              <Keyboard className="h-5 w-5" />
            </div>
            <h2 className="font-bold">Keyboard Shortcuts</h2>
          </div>
          <div className="overflow-hidden rounded-xl border border-gray-50 dark:border-gray-900">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:bg-gray-900/50">
                <tr>
                  <th className="py-3 px-6">Shortcut</th>
                  <th className="py-3 px-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-900">
                {[
                  { keys: ['Ctrl', 'N'], action: 'Create New Note' },
                  { keys: ['Ctrl', 'F'], action: 'Focus Search' },
                  { keys: ['Ctrl', 'Shift', 'P'], action: 'Toggle Privacy Mode' },
                  { keys: ['Esc'], action: 'Close Overlays' },
                  { keys: ['Alt', 'N'], action: 'New Note (Alt)' },
                ].map((s) => (
                  <tr key={s.action} className="group transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-900/30">
                    <td className="py-4 px-6">
                      <div className="flex gap-1.5">
                        {s.keys.map(k => (
                          <kbd key={k} className="inline-flex h-6 min-w-[24px] items-center justify-center rounded border border-gray-200 bg-white px-1.5 font-mono text-[10px] font-bold text-gray-900 shadow-[0_1px_0_0_rgba(0,0,0,0.1)] dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100 dark:shadow-[0_1px_0_0_rgba(255,255,255,0.05)]">
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400 font-medium">{s.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="flex items-center gap-2 text-xs text-gray-400 italic">
             <Info className="h-3 w-3" />
             "Shortcuts work best when the application is focused."
          </p>
        </section>

        {/* Privacy Information */}
        <section className="group space-y-6 rounded-2xl border border-gray-100 p-8 dark:border-gray-900 bg-white dark:bg-gray-950 shadow-sm transition-all hover:shadow-md hover:border-gray-200 dark:hover:border-gray-800">
          <div className="flex items-center gap-3 text-gray-900 dark:text-gray-100">
            <div className="rounded-lg bg-emerald-50 p-2 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
              <Shield className="h-5 w-5" />
            </div>
            <h2 className="font-bold">Privacy Policy</h2>
          </div>
          <div className="space-y-4 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
            <div className="flex gap-3">
              <div className="mt-0.5 rounded-full bg-emerald-500/10 p-1 shrink-0">
                <Database className="h-3 w-3 text-emerald-500" />
              </div>
              <p>Notes are stored <span className="font-bold text-gray-900 dark:text-gray-100">locally</span> on your device using IndexedDB.</p>
            </div>
            <div className="flex gap-3">
              <div className="mt-0.5 rounded-full bg-blue-500/10 p-1 shrink-0">
                <Globe className="h-3 w-3 text-blue-500" />
              </div>
              <p>No mandatory cloud sync. Your data remains under <span className="font-bold text-gray-900 dark:text-gray-100">your control</span>.</p>
            </div>
            <div className="flex gap-3">
              <div className="mt-0.5 rounded-full bg-amber-500/10 p-1 shrink-0">
                <Zap className="h-3 w-3 text-amber-500" />
              </div>
              <p>Offline-first architecture. Access your notes <span className="font-bold text-gray-900 dark:text-gray-100">without internet</span>.</p>
            </div>
            <div className="flex gap-3">
              <div className="mt-0.5 rounded-full bg-purple-500/10 p-1 shrink-0">
                <ShieldCheck className="h-3 w-3 text-purple-500" />
              </div>
              <p>Privacy Mode visually <span className="font-bold text-gray-900 dark:text-gray-100">hides sensitive content</span> on screen.</p>
            </div>
          </div>
        </section>

        {/* Quick Actions Section */}
        <section className="lg:col-span-3 space-y-6 rounded-2xl border border-gray-100 p-8 dark:border-gray-900 bg-white dark:bg-gray-950 shadow-sm">
          <div className="flex items-center gap-3 text-gray-900 dark:text-gray-100">
             <div className="rounded-lg bg-red-50 p-2 dark:bg-red-900/20 text-red-600 dark:text-red-400">
               <Settings2 className="h-5 w-5" />
             </div>
             <h2 className="font-bold">System Actions</h2>
          </div>
          <div className="flex flex-wrap gap-4">
             <Button
               variant="outline"
               className="h-11 px-6 font-bold border-gray-100 dark:border-gray-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-600"
               onClick={() => {
                 loadNotes();
                 loadLists();
               }}
             >
               <RefreshCw className="mr-2 h-4 w-4" />
               Refresh Stats
             </Button>
             <Button
               variant="outline"
               className="h-11 px-6 font-bold border-gray-100 dark:border-gray-800 hover:bg-amber-50 dark:hover:bg-amber-950/20 hover:text-amber-600"
               onClick={() => setShowClearCacheConfirm(true)}
             >
               <Trash2 className="mr-2 h-4 w-4" />
               Clear App Cache
             </Button>
             <Button
               variant="outline"
               className="h-11 px-6 font-bold border-gray-100 dark:border-gray-800 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600"
               onClick={() => setShowResetSettingsConfirm(true)}
             >
               <RotateCw className="mr-2 h-4 w-4" />
               Reset UI Settings
             </Button>
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
            ⚠️ These actions will not delete your notes or attachments.
          </p>
        </section>

        {/* Developer & Repository Link */}
        <section className="md:col-span-2 space-y-6 rounded-2xl border border-gray-100 p-8 dark:border-gray-900 bg-white dark:bg-gray-950 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 text-gray-900 dark:text-gray-100">
            <div className="rounded-lg bg-gray-50 p-2 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
              <User className="h-5 w-5" />
            </div>
            <h2 className="font-bold">Developer Information</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-4">
               <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Technology Stack</div>
               <div className="flex flex-wrap gap-1.5">
                  {['React 19', 'TypeScript', 'Vite 6', 'Zustand', 'IndexedDB', 'Tailwind v4'].map(tech => (
                    <span key={tech} className="px-2.5 py-1 rounded-md bg-gray-50 dark:bg-gray-900 text-[10px] font-bold text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-800">
                      {tech}
                    </span>
                  ))}
               </div>
            </div>
            <div className="space-y-4">
               <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Open Source</div>
               <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">License</span>
                    <span className="font-bold">MIT License</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Repository</span>
                    <a
                      href="https://github.com/karalapatiphanicharan-cyber/Notely"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-bold text-blue-600 hover:underline dark:text-blue-400"
                    >
                      <Globe className="h-4 w-4" />
                      GitHub
                    </a>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Public Access</span>
                    <span className="font-bold text-emerald-500">Yes</span>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* About Section Polished */}
        <section className="space-y-6 rounded-2xl border border-gray-100 p-8 dark:border-gray-900 bg-white dark:bg-gray-950 shadow-sm transition-all hover:shadow-md">
           <div className="flex items-center gap-3 text-gray-900 dark:text-gray-100">
              <div className="rounded-lg bg-emerald-50 p-2 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
                <Zap className="h-5 w-5" />
              </div>
              <h2 className="font-bold">About Notely</h2>
           </div>
           <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
             Notely is a modern, offline-first note-taking application built for speed, privacy, and productivity. It enables users to manage notes, attachments, and to-do lists entirely within their browser using local storage technologies, providing a secure and distraction-free experience.
           </p>
           <div className="pt-2">
              <a
                href="https://github.com/karalapatiphanicharan-cyber/Notely"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-xs font-bold text-white transition-all hover:bg-black active:scale-[0.98] dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                <Globe className="h-4 w-4" />
                View Repository on GitHub
              </a>
           </div>
        </section>
      </div>

      {/* Footer Links */}
      <footer className="border-t border-gray-100 dark:border-gray-900 pt-12 text-center space-y-8 pb-12">
        <div className="flex flex-col items-center gap-4">
           <div className="flex justify-center gap-8">
             <a href="https://github.com/karalapatiphanicharan-cyber/Notely" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
               <Globe className="h-4 w-4" />
               Repository
             </a>
             <button className="flex items-center gap-2 text-xs font-bold text-gray-400 cursor-not-allowed opacity-50">
               <ExternalLink className="h-4 w-4" />
               Documentation
             </button>
           </div>
           <div className="text-[10px] font-black text-gray-300 dark:text-gray-800 uppercase tracking-[0.4em]">
             &copy; {new Date().getFullYear()} Notely &bull; Privacy First Architecture
           </div>
        </div>
      </footer>

      <ConfirmModal
        isOpen={showClearCacheConfirm}
        title="Clear Application Cache?"
        message="This will unregister the service worker and clear all cached assets. The application will reload. Your notes and attachments will NOT be deleted."
        onConfirm={handleClearCache}
        onCancel={() => setShowClearCacheConfirm(false)}
      />

      <ConfirmModal
        isOpen={showResetSettingsConfirm}
        title="Reset UI Settings?"
        message="This will reset your theme, sidebar, and privacy mode preferences to their defaults. The application will reload. Your notes and tasks will remain intact."
        onConfirm={handleResetSettings}
        onCancel={() => setShowResetSettingsConfirm(false)}
      />
    </div>
  );
}
