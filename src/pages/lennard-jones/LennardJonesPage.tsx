import React, { useState } from 'react'
import type { Annotation, Data, Shape } from 'plotly.js'
import PlotlyChart from '../../components/Plot'
import { Slider } from '../../components/Controls'
import { useThemeColors, type ThemeColors } from '../../lib/themeColors'
import { axis, baseLayout, staticConfig } from '../../lib/plotTheme'

const MARK = '#dc2626' // the caption calls the potential minimum the "red marker"

interface PlotProps {
  fn: (r: number) => number
  rMin: number
  rMax: number
  yMin: number
  yMax: number
  color: string
  yLabel: string
  sigma: number
  mark: { r: number; y: number; label: string }
  ariaLabel: string
  theme: ThemeColors
}

const Plot: React.FC<PlotProps> = ({ fn, rMin, rMax, yMin, yMax, color, yLabel, sigma, mark, ariaLabel, theme }) => {
  // Sample the curve, leaving a gap where it leaves the plot area
  const xs: number[] = []
  const ys: (number | null)[] = []
  const N = 300
  for (let i = 0; i <= N; i++) {
    const r = rMin + ((rMax - rMin) * i) / N
    const v = fn(r)
    xs.push(r)
    ys.push(v > yMax || v < yMin ? null : v)
  }

  const xTicks = [0, 1, 2, 3, 4].map((i) => rMin + ((rMax - rMin) * i) / 4)
  const yTicks = [0, 1, 2, 3, 4].map((i) => yMin + ((yMax - yMin) * i) / 4)

  const data: Data[] = [
    { x: xs, y: ys, type: 'scatter', mode: 'lines', line: { color, width: 3 } },
    {
      x: [mark.r],
      y: [mark.y],
      type: 'scatter',
      mode: 'markers',
      marker: { size: 12, color: MARK, line: { color: theme.plotBg, width: 2 } },
    },
  ]
  const shapes: Partial<Shape>[] = [
    // zero line
    { type: 'line', xref: 'paper', x0: 0, x1: 1, y0: 0, y1: 0, line: { color: theme.muted, width: 1.5 } },
    // hard-sphere diameter r = sigma
    { type: 'line', xref: 'x', yref: 'paper', x0: sigma, x1: sigma, y0: 0, y1: 1, line: { color: theme.muted, width: 1.2, dash: 'dash' } },
  ]
  const annotations: Partial<Annotation>[] = [
    { xref: 'x', yref: 'paper', x: sigma, y: 1, xanchor: 'right', yanchor: 'top', xshift: -4, text: 'r = σ', showarrow: false, font: { size: 12, color: theme.muted } },
    { x: mark.r, y: mark.y, xanchor: 'left', yanchor: 'bottom', xshift: 8, yshift: 4, text: mark.label, showarrow: false, font: { size: 12, color: theme.text } },
  ]

  return (
    <div role="img" aria-label={ariaLabel}>
      <PlotlyChart
        data={data}
        layout={{
          ...baseLayout(theme),
          // Room for the last x tick label, which sits on the right edge
          margin: { ...baseLayout(theme).margin, r: 24 },
          showlegend: false,
          xaxis: {
            ...axis(theme),
            title: { text: 'r (Å)' },
            // A hair of padding: Plotly hides a tick label that sits exactly on the range end.
            range: [rMin - (rMax - rMin) * 1e-6, rMax + (rMax - rMin) * 1e-6],
            tickvals: xTicks,
            ticktext: xTicks.map((r) => r.toFixed(1)),
          },
          yaxis: {
            ...axis(theme),
            title: { text: yLabel },
            range: [yMin, yMax],
            tickvals: yTicks,
            ticktext: yTicks.map((v) => v.toFixed(Math.abs(yMax - yMin) < 5 ? 2 : 1)),
          },
          shapes,
          annotations,
        }}
        config={staticConfig}
        useResizeHandler
        className="plot"
      />
    </div>
  )
}

export const LennardJonesPage: React.FC = () => {
  const [epsilon, setEpsilon] = useState<number>(1.0) // well depth, kJ/mol
  const [sigma, setSigma] = useState<number>(3.4) // distance where V = 0, Å
  const theme = useThemeColors()

  const rm = Math.pow(2, 1 / 6) * sigma // equilibrium distance
  const rF = Math.pow(26 / 7, 1 / 6) * sigma // distance of maximum attraction

  const V = (r: number) => {
    const s6 = Math.pow(sigma / r, 6)
    return 4 * epsilon * (s6 * s6 - s6)
  }
  const F = (r: number) => {
    const s6 = Math.pow(sigma / r, 6)
    return ((24 * epsilon) / r) * (2 * s6 * s6 - s6) // F = -dV/dr, positive = repulsive
  }
  const fAttract = Math.abs(F(rF))

  const rLo = 0.85 * sigma
  const rHi = 3.0 * sigma

  return (
    <article className="page">
      <header className="page-intro compact">
        <h1>Lennard-Jones Potential Explorer</h1>
        <p className="lede">
          The molecular basis of adhesion, adsorption, and cohesion via the 12-6 potential model.
        </p>
      </header>

      <figure id="sim-figure" className="figure hero" aria-label="Lennard-Jones potential and force">
        <div className="sim-grid">
          <div className="plot-col">
            <h2 className="panel-title">Potential energy V(r)</h2>
            <Plot
              fn={V}
              rMin={rLo}
              rMax={rHi}
              yMin={-1.3 * epsilon}
              yMax={2.5 * epsilon}
              color={theme.data1}
              yLabel="V (kJ/mol)"
              sigma={sigma}
              mark={{ r: rm, y: -epsilon, label: 'r_m, −ε' }}
              ariaLabel="Lennard-Jones potential energy curve"
              theme={theme}
            />
          </div>
          <div className="plot-col">
            <h2 className="panel-title">Force F(r) = −dV/dr</h2>
            <Plot
              fn={F}
              rMin={rLo}
              rMax={rHi}
              yMin={-1.5 * fAttract}
              yMax={2.5 * fAttract}
              color={theme.data2}
              yLabel="F (kJ/(mol·Å))"
              sigma={sigma}
              mark={{ r: rm, y: 0, label: 'F = 0 at r_m' }}
              ariaLabel="Lennard-Jones force curve"
              theme={theme}
            />
          </div>
        </div>

        <div className="figure-controls hero-controls">
          <h2 className="panel-title">Parameters</h2>
          <Slider
            id="lj-eps"
            label={<>Well depth (ε):{' '}</>}
            value={`${epsilon.toFixed(2)} kJ/mol`}
            min={0.2}
            max={3.0}
            step={0.1}
            pos={epsilon}
            onChange={setEpsilon}
          />
          <Slider
            id="lj-sigma"
            label={<>Distance parameter (σ):{' '}</>}
            value={`${sigma.toFixed(2)} Å`}
            min={2.0}
            max={5.0}
            step={0.1}
            pos={sigma}
            onChange={setSigma}
          />
        </div>

        <div className="figure-results">
          <h3 className="panel-title">Key Metrics</h3>
          <dl className="results">
            <div>
              <dt>Equilibrium distance (r<sub>m</sub>):</dt>{' '}
              <dd>{rm.toFixed(3)} Å (2<sup>1/6</sup>σ ≈ 1.122σ)</dd>
            </div>
            <div>
              <dt>Well depth:</dt>{' '}
              <dd>V(r<sub>m</sub>) = −{epsilon.toFixed(2)} kJ/mol</dd>
            </div>
            <div>
              <dt>Zero crossing:</dt>{' '}
              <dd>V = 0 at r = σ = {sigma.toFixed(2)} Å</dd>
            </div>
            <div>
              <dt>Maximum attraction:</dt>{' '}
              <dd>{fAttract.toFixed(3)} kJ/(mol·Å) at r = {rF.toFixed(2)} Å</dd>
            </div>
          </dl>
          <p className="note">
            <strong>Hard-sphere limit:</strong> steep repulsion as r → σ and below (r<sup>−12</sup> dominance),
            so the molecule acts like a rigid sphere of diameter ≈ σ.
          </p>
        </div>

        <figcaption>
          Red marker: the potential minimum (r<sub>m</sub>, −ε), where the force is zero. Positive force is
          repulsive, negative is attractive.
        </figcaption>
      </figure>
    </article>
  )
}
