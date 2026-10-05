import { useEffect, useState } from 'react'

// Light/dark theme. index.html sets <html data-theme> before first paint (saved choice,
// else the OS setting); this module switches it at runtime. A saved choice wins; with
// none saved, the page keeps following the OS setting.

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'theme'
const META_COLORS: Record<Theme, string> = { light: '#f8f8f6', dark: '#131517' }
const darkQuery = () => window.matchMedia('(prefers-color-scheme: dark)')

function saved(): Theme | null {
  try {
    const t = localStorage.getItem(STORAGE_KEY)
    return t === 'light' || t === 'dark' ? t : null
  } catch {
    return null
  }
}

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

  useEffect(() => {
    const offTheme = onThemeChange(() => setTheme(currentTheme()))
    // Follow the OS setting until the reader picks a theme.
    const mq = darkQuery()
    const onSystem = () => saved() || apply(mq.matches ? 'dark' : 'light')
    mq.addEventListener('change', onSystem)
    return () => {
      offTheme()
      mq.removeEventListener('change', onSystem)
    }
  }, [])

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
