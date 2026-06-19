import { NavLink } from 'react-router-dom';
import logo from '../../assets/logo.png';
import {
  Home,
  FileText,
  Star,
  Archive,
  Trash2,
  Settings,
  Moon,
  Sun,
  Monitor,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useNotesStore } from '../../store/notesStore';
import { cn } from '../../utils/cn';
import { Button } from '../ui/Button';

const navItems = [
  { icon: Home, label: 'Home', path: '/', isHome: true },
  { icon: FileText, label: 'All Notes', path: '/notes' },
  { icon: Star, label: 'Favorites', path: '/favorites' },
  { icon: Archive, label: 'Archive', path: '/archive' },
  { icon: Trash2, label: 'Trash', path: '/trash' },
];

export function Sidebar() {
  const { isSidebarOpen, setSidebarOpen, theme, setTheme, isSidebarCollapsed, toggleSidebarCollapse } = useUIStore();
  const clearSearch = useNotesStore((state) => state.clearSearch);

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const ThemeIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;

  return (
    <>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-gray-200 bg-white transition-all duration-300 lg:static lg:translate-x-0 dark:border-gray-800 dark:bg-gray-950",
          !isSidebarOpen && "-translate-x-full",
          isSidebarCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className={cn(
          "flex h-16 items-center px-6",
          isSidebarCollapsed ? "justify-center" : "justify-between"
        )}>
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-3 font-bold text-xl tracking-tight">
              <img src={logo} alt="Notely Logo" className="h-8 w-8 object-contain" />
              Notely
            </div>
          )}
          {isSidebarCollapsed && (
            <img src={logo} alt="Notely Logo" className="h-8 w-8 object-contain" />
          )}
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4 overflow-hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              title={isSidebarCollapsed ? item.label : undefined}
              onClick={() => {
                if (item.isHome) clearSearch();
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
              className={({ isActive }) => cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isSidebarCollapsed && "justify-center px-0",
                isActive
                  ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-100"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!isSidebarCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-gray-200 p-3 space-y-1 dark:border-gray-800 overflow-hidden">
          <button
            onClick={toggleTheme}
            title={isSidebarCollapsed ? `Theme: ${theme}` : undefined}
            className={cn(
              "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-100",
              isSidebarCollapsed && "justify-center px-0"
            )}
          >
            <ThemeIcon className="h-4 w-4 shrink-0" />
            {!isSidebarCollapsed && <span>Theme: {theme.charAt(0).toUpperCase() + theme.slice(1)}</span>}
          </button>
          <NavLink
            to="/settings"
            title={isSidebarCollapsed ? "Settings" : undefined}
            onClick={() => {
              if (window.innerWidth < 1024) setSidebarOpen(false);
            }}
            className={({ isActive }) => cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isSidebarCollapsed && "justify-center px-0",
              isActive
                ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-100"
            )}
          >
            <Settings className="h-4 w-4 shrink-0" />
            {!isSidebarCollapsed && <span>Settings</span>}
          </NavLink>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebarCollapse}
            className="mt-4 hidden w-full items-center justify-center lg:flex"
          >
            {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </aside>
    </>
  );
}
