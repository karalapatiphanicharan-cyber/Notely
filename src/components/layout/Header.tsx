import { Menu, Search, User, Moon, Sun } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { Button } from '../ui/Button';

export function Header() {
  const { toggleSidebar, theme, setTheme } = useUIStore();

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white/80 px-4 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80 lg:px-8">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="lg:hidden"
          aria-label="Toggle Menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Home</h2>
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        <div className="relative hidden items-center sm:flex">
          <Search className="absolute left-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search notes..."
            className="h-9 w-64 rounded-full bg-gray-100 pl-10 pr-4 text-sm outline-none transition-all focus:ring-2 focus:ring-black/5 dark:bg-gray-900 dark:focus:ring-white/5"
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden"
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="hidden sm:inline-flex"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
          <div className="flex h-full w-full items-center justify-center text-gray-400">
            <User className="h-5 w-5" />
          </div>
        </div>
      </div>
    </header>
  );
}
