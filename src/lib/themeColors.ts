import { useEffect, useState } from 'react'

// Canvas drawing and Plotly need concrete colors, so they read the CSS design tokens
// (src/design-tokens.css) here and re-read them when the OS switches light/dark.

const TOKENS = {
  text: '--color-text',
  muted: '--color-text-muted',
  surface: '--color-surface',
  border: '--color-border',
  data1: '--data-1',
  data2: '--data-2',
  data2Soft: '--data-2-soft',
  grid: '--data-grid',
  axis: '--data-axis',
  plotBg: '--data-plot-bg',
  layer1: '--layer-1',
  layer2: '--layer-2',
  layer3: '--layer-3',
  gas: '--gas',
  solid: '--solid',
  solidLine: '--solid-line',
} as const

export type ThemeColors = Record<keyof typeof TOKENS, string>

export function readThemeColors(): ThemeColors {
  const style = getComputedStyle(document.documentElement)
  const out = {} as ThemeColors
  for (const [key, prop] of Object.entries(TOKENS)) out[key as keyof ThemeColors] = style.getPropertyValue(prop).trim()
  return out
}

const darkQuery = () => window.matchMedia('(prefers-color-scheme: dark)')

/** Calls `cb` whenever the color scheme changes; returns an unsubscribe function. */
export function onThemeChange(cb: () => void): () => void {
  const mq = darkQuery()
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}

export function useThemeColors(): ThemeColors {
  const [colors, setColors] = useState(readThemeColors)
  useEffect(() => onThemeChange(() => setColors(readThemeColors())), [])
  return colors
}
