import { lazy, Suspense } from 'react'
import type { PlotParams } from 'react-plotly.js'

// Plotly is the biggest dependency, so it loads in its own chunk. Until it arrives, a quiet placeholder
// of the same size (same className) holds the plot's place, so the layout does not jump.
const PlotlyPlot = lazy(() => import('./PlotlyPlot'))

export default function Plot(props: PlotParams) {
  return (
    <Suspense
      fallback={
        <div className={`${props.className ?? ''} plot-loading`} aria-hidden="true">
          Loading plot…
        </div>
      }
    >
      <PlotlyPlot {...props} />
    </Suspense>
  )
}
