import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { toggleTheme } from '../../store/slices/themeSlice';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const theme = useAppSelector((state) => state.theme.theme);
  const dispatch = useAppDispatch();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={() => dispatch(toggleTheme())}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label="Toggle theme"
      className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 transition-colors dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 ${className}`}
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}
