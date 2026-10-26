import { useMemo } from 'react'
import type { Data, Shape } from 'plotly.js'
import Plot from '../../components/Plot'
import type { ThemeColors } from '../../lib/themeColors'
import { axis, baseLayout, staticConfig } from '../../lib/plotTheme'
import { bcfRate, controllingRegime, diffusionRate, S_RANGE } from '../../lib/crystal'

// Sketch of growth rate against supersaturation for the two controlling steps (arbitrary units).

const N_POINTS = 120

export default function RegimePlot({ S, theme }: { S: number; theme: ThemeColors }) {
  const curves = useMemo(() => {
    const xs: number[] = []
    const bcf: number[] = []
    const diff: number[] = []
    for (let i = 0; i <= N_POINTS; i++) {
      const s = S_RANGE[0] + ((S_RANGE[1] - S_RANGE[0]) * i) / N_POINTS
      xs.push(s)
      bcf.push(bcfRate(s))
      diff.push(diffusionRate(s))
    }
    return { xs, bcf, diff }
  }, [])

  const regime = controllingRegime(S)
  const data: Data[] = [
    { x: curves.xs, y: curves.bcf, type: 'scatter', mode: 'lines', line: { color: theme.data1, width: 2.5 } },
    { x: curves.xs, y: curves.diff, type: 'scatter', mode: 'lines', line: { color: theme.data2, width: 2.5 } },
    {
      x: [S, S],
      y: [bcfRate(S), diffusionRate(S)],
      type: 'scatter',
      mode: 'markers',
      marker: { size: 10, color: [theme.data1, theme.data2], line: { color: theme.plotBg, width: 2 } },
    },
  ]
  const shapes: Partial<Shape>[] = [
    { type: 'line', xref: 'x', yref: 'paper', x0: S, x1: S, y0: 0, y1: 1, line: { color: theme.muted, width: 1.2, dash: 'dash' } },
  ]

  return (
    <div className="regime">
      <h3 className="regime-title">Growth rate vs supersaturation</h3>
      <ul className="plot-legend" aria-label="Plot legend">
        <li>
          <span className="key-line" style={{ borderColor: theme.data1 }} /> surface reaction (BCF): parabolic → linear
        </li>
        <li>
          <span className="key-line" style={{ borderColor: theme.data2 }} /> diffusion: linear in (S − 1)
        </li>
      </ul>
      <div
        role="img"
        aria-label={`Sketch of growth rate G against supersaturation S from 1 to 5. Marker at S = ${S.toFixed(1)}: ${regime === 'surface' ? 'surface reaction' : 'diffusion'} is the slower step.`}
      >
        <Plot
          data={data}
          layout={{
            ...baseLayout(theme),
            showlegend: false,
            margin: { l: 48, r: 12, t: 8, b: 44 },
            xaxis: { ...axis(theme), title: { text: 'Supersaturation S = c/c*' }, range: [S_RANGE[0], S_RANGE[1] + 0.08] },
            yaxis: { ...axis(theme), title: { text: 'Growth rate G (a.u.)' }, showticklabels: false, rangemode: 'tozero' },
            shapes,
          }}
          config={staticConfig}
          useResizeHandler
          className="plot regime-plot"
        />
      </div>
      <p className="insight" aria-live="polite">
        At S = {S.toFixed(1)} the slower step is{' '}
        <strong>{regime === 'surface' ? 'surface integration' : 'diffusion to the surface'}</strong>, so growth is{' '}
        {regime === 'surface' ? 'surface-reaction controlled: compact and faceted.' : 'diffusion controlled: branched at high S.'}
      </p>
    </div>
  )
}
