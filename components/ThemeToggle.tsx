import { useTheme } from '@/contexts/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900 hover:bg-violet-200 dark:hover:bg-violet-800 transition-colors"
      aria-label="Cambiar tema"
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  )
} 