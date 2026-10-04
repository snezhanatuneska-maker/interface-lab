// Plotly wrapper built from the lightweight "basic" bundle (scatter, bar, pie)
// instead of the full plotly.js, which keeps the JS payload much smaller.
// Swap in another dist (e.g. plotly.js-cartesian-dist-min) if more trace types are needed.
import Plotly from 'plotly.js-basic-dist-min'
import createPlotlyComponent from 'react-plotly.js/factory'

const Plot = createPlotlyComponent(Plotly)

export default Plot
