import type { Layout } from 'plotly.js'
import type { ThemeColors } from './themeColors'

// Shared Plotly styling so every tool's plots look the same and follow the light/dark theme.

export const baseLayout = (t: ThemeColors): Partial<Layout> => ({
  autosize: true,
  margin: { l: 60, r: 12, t: 12, b: 48 },
  // The family name is quoted: unquoted, "Source Sans 3" is invalid CSS and Plotly fell back to the browser default.
  font: { family: "'Source Sans 3', system-ui, Helvetica, Arial, sans-serif", size: 14, color: t.text },
  paper_bgcolor: 'rgba(0,0,0,0)',
  plot_bgcolor: t.plotBg,
  hovermode: false,
  legend: { orientation: 'h', x: 0, y: 1.02, yanchor: 'bottom', bgcolor: 'rgba(0,0,0,0)', font: { size: 13 } },
  dragmode: false,
})

export const axis = (t: ThemeColors) => ({
  zeroline: false,
  gridcolor: t.grid,
  linecolor: t.axis,
  tickcolor: t.axis,
  showline: true,
  ticks: 'outside' as const,
})

/** Plotly config for figures that are driven by sliders rather than mouse interaction. */
export const staticConfig = { staticPlot: true, responsive: true }
