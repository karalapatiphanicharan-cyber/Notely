import { Search, Menu, Sun, Moon, Monitor } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useNotesStore } from '../../store/notesStore';
import { Button } from '../ui/Button';

export function Header() {
  const { toggleSidebar, theme, setTheme } = useUIStore();
  const { searchQuery, setSearchQuery } = useNotesStore();

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const ThemeIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white/80 px-4 backdrop-blur-md lg:px-8 dark:border-gray-800 dark:bg-gray-950/80">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Home
        </h1>
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-64 rounded-md border border-gray-200 bg-gray-50 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-black/5 dark:border-gray-800 dark:bg-gray-900 dark:focus:ring-white/5"
          />
        </div>

        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          <ThemeIcon className="h-5 w-5" />
        </Button>

        <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-800" />
      </div>
    </header>
  );
}
