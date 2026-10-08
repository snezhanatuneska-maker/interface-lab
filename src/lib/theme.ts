import { useEffect, useState } from 'react'

// Light/dark theme. Light is the default; index.html sets <html data-theme> before first paint
// (the reader's saved choice, else light) and this module switches it at runtime.

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'theme'
const META_COLORS: Record<Theme, string> = { light: '#f8f8f6', dark: '#131517' }

export function currentTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', META_COLORS[theme])
}

/** Calls `cb` whenever the theme changes; returns an unsubscribe function. */
export function onThemeChange(cb: () => void): () => void {
  const mo = new MutationObserver(cb)
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  return () => mo.disconnect()
}

export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState(currentTheme)

  useEffect(() => onThemeChange(() => setTheme(currentTheme())), [])

  const toggle = () => {
    const next: Theme = currentTheme() === 'dark' ? 'light' : 'dark'
    apply(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // storage blocked: the choice lasts for this page view only
    }
  }

  return [theme, toggle]
}
