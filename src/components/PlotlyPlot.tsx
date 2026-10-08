// Plotly wrapper built from the lightweight "basic" bundle (scatter, bar, pie)
// instead of the full plotly.js, which keeps the JS payload much smaller.
// Swap in another dist (e.g. plotly.js-cartesian-dist-min) if more trace types are needed.
import Plotly from 'plotly.js-basic-dist-min'
import createPlotlyComponent from 'react-plotly.js/factory'
import type { PlotParams } from 'react-plotly.js'

const Plot = createPlotlyComponent(Plotly)

// react-plotly's default style is inline-block, which leaves a baseline gap below the plot;
// block keeps the plot exactly the height of its "Loading plot…" placeholder.
const STYLE = { position: 'relative', display: 'block' } as const

export default function PlotlyPlot(props: PlotParams) {
  return <Plot style={STYLE} {...props} />
}
