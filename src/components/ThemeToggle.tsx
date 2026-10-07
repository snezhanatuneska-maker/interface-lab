import { useTheme } from '../lib/theme'

/** Header button that switches between the light and dark theme. */
export default function ThemeToggle() {
  const [theme, toggle] = useTheme()
  const next = theme === 'dark' ? 'light' : 'dark'
  return (
    <button type="button" className="theme-toggle" onClick={toggle} aria-label={`Switch to ${next} theme`} title={`Switch to ${next} theme`}>
      {next} theme
    </button>
  )
}
