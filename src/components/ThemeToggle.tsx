import { useTheme } from '../lib/theme'

const Sun = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="theme-icon">
    <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
    <path
      d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
)

const Moon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="theme-icon">
    <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  </svg>
)

/** Header button that switches between the light and dark theme. */
export default function ThemeToggle() {
  const [theme, toggle] = useTheme()
  const next = theme === 'dark' ? 'light' : 'dark'
  return (
    <button type="button" className="theme-toggle" onClick={toggle} aria-label={`Switch to ${next} theme`} title={`Switch to ${next} theme`}>
      {theme === 'dark' ? <Sun /> : <Moon />}
      <span className="theme-toggle-text">{theme === 'dark' ? 'Light' : 'Dark'}</span>
    </button>
  )
}
