import { NavLink } from 'react-router-dom';
import {
  Home,
  FileText,
  Star,
  Archive,
  Trash2,
  Settings,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { clsx } from 'clsx';

export function Sidebar() {
  const { theme, setTheme, isSidebarOpen } = useUIStore();

  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: FileText, label: 'All Notes', href: '/notes' },
    { icon: Star, label: 'Favorites', href: '/favorites' },
    { icon: Archive, label: 'Archive', href: '/archive' },
    { icon: Trash2, label: 'Trash', href: '/trash' },
  ];

  return (
    <aside
      className={clsx(
        'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-gray-50 transition-transform duration-300 dark:border-gray-800 dark:bg-gray-950 lg:static lg:translate-x-0',
        !isSidebarOpen && '-translate-x-full'
      )}
    >
      <div className="flex h-16 items-center px-6">
        <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Notely</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:text-white dark:ring-gray-800'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white'
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto border-t border-gray-200 p-4 dark:border-gray-800">
        <div className="flex items-center justify-around mb-4 rounded-lg bg-gray-100 p-1 dark:bg-gray-900">
          <button
            onClick={() => setTheme('light')}
            className={clsx(
              'rounded-md p-1.5 transition-colors',
              theme === 'light' ? 'bg-white shadow-sm dark:bg-gray-800' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
            )}
            title="Light Mode"
          >
            <Sun className="h-4 w-4" />
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={clsx(
              'rounded-md p-1.5 transition-colors',
              theme === 'dark' ? 'bg-white shadow-sm dark:bg-gray-800' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
            )}
            title="Dark Mode"
          >
            <Moon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setTheme('system')}
            className={clsx(
              'rounded-md p-1.5 transition-colors',
              theme === 'system' ? 'bg-white shadow-sm dark:bg-gray-800' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
            )}
            title="System Preference"
          >
            <Monitor className="h-4 w-4" />
          </button>
        </div>

        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white transition-colors">
          <Settings className="h-4 w-4" />
          Settings
        </button>
      </div>
    </aside>
  );
}
