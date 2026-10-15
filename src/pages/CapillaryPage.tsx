import { useMemo, useState } from 'react'
import type { Annotation, Data, Shape } from 'plotly.js'
import Plot from '../components/Plot'
import { LogSlider, Segmented, Slider } from '../components/Controls'
import { useThemeColors } from '../lib/themeColors'
import { axis, baseLayout, staticConfig } from '../lib/plotTheme'
import {
  capillaryPressure,
  jurinHeight,
  LIQUIDS,
  R_DEFAULT,
  R_RANGE,
  THETA_DEFAULT,
  THETA_RANGE,
  type LiquidId,
} from '../lib/capillary'
import PoreView from './capillary/PoreView'
import { insight } from './capillary/insight'
import Equations from './capillary/Equations'
import TryThis, { type Preset } from './capillary/TryThis'
import Condensation from './capillary/Condensation'

const N_POINTS = 200
const ATM = 0.101325 // MPa
// |P_c| axis (log): 0.01–300 MPa covers 1 nm–1 µm pores at any angle but the few degrees around 90°.
const Y_RANGE: [number, number] = [-2, Math.log10(300)]

const sig = (v: number) => Number(v.toPrecision(3)).toLocaleString('en-US').replace('-', '−')

/** Height with a sensible unit: km in nanopores, m or mm in wide ones. */
function fmtHeight(h: number): string {
  const a = Math.abs(h)
  if (a >= 1000) return `${sig(a / 1000)} km`
  if (a >= 1) return `${sig(a)} m`
  return `${sig(a * 1000)} mm`
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

function Readout({ pc, h }: { pc: number; h: number }) {
  const wetting = pc > 0
  return (
    <div className="coverage">
      <span className="coverage-label">
        Capillary pressure <em>P</em>
        <sub>c</sub>
      </span>
      <span className={`coverage-value ${wetting ? 'wetting' : 'nonwetting'}`}>{sig(pc)} MPa</span>
      <span className="coverage-sub">
        {sig(Math.abs(pc) / ATM)} atm · {wetting ? 'rise' : 'depression'} h = {fmtHeight(h)}
      </span>
    </div>
  )
}

export default function CapillaryPage() {
  const [r, setR] = useState(R_DEFAULT)
  const [theta, setTheta] = useState(THETA_DEFAULT)
  const [liquidId, setLiquidId] = useState<LiquidId>('water')
  const [paused, setPaused] = useState(prefersReducedMotion)
  // Bump runId to restart the pore view; atEquilibrium says whether it restarts settled or at the reservoir level.
  const [run, setRun] = useState(() => ({ id: 0, atEquilibrium: prefersReducedMotion() }))
  const theme = useThemeColors()
  const liquid = LIQUIDS[liquidId]

  const pc = capillaryPressure(r, theta, liquid)
  const h = jurinHeight(r, theta, liquid)
  const wetting = pc >= 0
  const color = wetting ? theme.data1 : theme.data2

  const restart = (atEquilibrium = false) => setRun((p) => ({ id: p.id + 1, atEquilibrium }))

  const reset = () => {
    setR(R_DEFAULT)
    setLiquidId('water')
    setTheta(THETA_DEFAULT)
    restart()
  }

  const switchLiquid = (id: LiquidId) => {
    if (id === liquidId) return
    setLiquidId(id)
    setTheta(LIQUIDS[id].thetaDefault)
    restart() // a fresh pore dipped into the new liquid
  }

  const applyPreset = (p: Preset) => {
    if (p.r !== undefined) setR(p.r)
    if (p.theta !== undefined) setTheta(p.theta)
    setLiquidId(p.liquid ?? 'water')
    setPaused(false)
    restart()
    // Scroll on the next frame, once the new setting has rendered: it can change the height of what is above the target.
    requestAnimationFrame(() => document.getElementById(p.target)?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  // ---------- |P_c| against r ----------
  const curves = useMemo(() => {
    const rs: number[] = []
    const now: number[] = []
    const max: number[] = []
    const [lo, hi] = R_RANGE
    for (let i = 0; i <= N_POINTS; i++) {
      const ri = lo * (hi / lo) ** (i / N_POINTS)
      rs.push(ri)
      now.push(Math.abs(capillaryPressure(ri, theta, liquid)))
      max.push(capillaryPressure(ri, 0, liquid))
    }
    return { rs, now, max }
  }, [theta, liquid])

  const data: Data[] = [
    {
      x: curves.rs,
      y: curves.max,
      type: 'scatter',
      mode: 'lines',
      line: { color: theme.muted, width: 1.5, dash: 'dot' },
    },
    {
      x: curves.rs,
      y: curves.now,
      type: 'scatter',
      mode: 'lines',
      line: { color, width: 3 },
    },
    {
      x: [r],
      y: [Math.abs(pc)],
      type: 'scatter',
      mode: 'markers',
      marker: { size: 12, color, line: { color: theme.plotBg, width: 2 } },
    },
  ]

  const shapes: Partial<Shape>[] = [
    { type: 'line', xref: 'paper', x0: 0, x1: 1, y0: ATM, y1: ATM, line: { color: theme.muted, width: 1.2, dash: 'dash' } },
    // Mesopore band (2–50 nm), where capillary condensation happens.
    { type: 'rect', xref: 'x', yref: 'paper', x0: 2, x1: 50, y0: 0, y1: 1, layer: 'below', fillcolor: theme.data2Soft, line: { width: 0 } },
  ]

  const annotations: Partial<Annotation>[] = [
    {
      xref: 'paper',
      x: 0.01,
      y: Math.log10(ATM),
      xanchor: 'left',
      yanchor: 'bottom',
      yshift: 2,
      text: '1 atm',
      showarrow: false,
      font: { size: 12, color: theme.muted },
    },
    {
      xref: 'x',
      yref: 'paper',
      x: Math.log10(10),
      y: 0,
      yanchor: 'bottom',
      yshift: 4,
      text: 'mesopores',
      showarrow: false,
      font: { size: 12, color: theme.data2 },
    },
  ]

  const plotLabel =
    `Log–log plot of capillary pressure magnitude against pore radius, 1 to 1000 nm: a straight line of slope −1. ` +
    `At r = ${r} nm and θ = ${Math.round(theta)}°: ${sig(pc)} MPa.`

  return (
    <article className="page">
      <header className="page-intro compact">
        <a className="back-link" href="#/">
          ← All tools
        </a>
        <h1>Capillary Pressure &amp; Pore Filling</h1>
        <p className="lede">
          Liquid in a narrow pore. Smaller pores and wetting walls pull harder; past 90° the liquid has to be pushed in,
          as mercury is. Then see why pores fill and empty at different vapour pressures.
        </p>
      </header>

      {/* ---------- Hero: pore view + P_c(r) ---------- */}
      <figure id="sim-figure" className="figure hero" aria-label="Pore view and capillary pressure plot">
        <div className="hero-head">
          <Readout pc={pc} h={h} />
          <ul className="layer-legend" aria-label="Legend">
            <li>
              <span className={`dot liquid-dot ${liquidId}`} /> {liquid.name}
            </li>
            <li>
              <span className="dot" style={{ background: 'var(--solid)' }} /> pore wall
            </li>
            <li>
              <span className="dot" style={{ background: 'var(--data-plot-bg)' }} /> vapour
            </li>
          </ul>
        </div>

        <div className="sim-grid">
          <PoreView
            key={run.id}
            r={r}
            theta={theta}
            paused={paused}
            atEquilibrium={run.atEquilibrium}
            liquid={liquidId}
            label={`Pore of radius ${r} nm, contact angle ${Math.round(theta)}°: the ${liquid.name} ${
              wetting ? 'rises' : 'is pushed down'
            }. Not to scale.`}
          />
          <div className="plot-col">
            <ul className="plot-legend" aria-label="Plot legend">
              <li>
                <span className="key-line" style={{ borderColor: color }} /> |P<sub>c</sub>| at θ = {Math.round(theta)}°
              </li>
              <li>
                <span className="key-line dotted" style={{ borderColor: theme.muted }} /> θ = 0° (upper limit)
              </li>
            </ul>
            <div role="img" aria-label={plotLabel}>
              <Plot
                data={data}
                layout={{
                  ...baseLayout(theme),
                  showlegend: false,
                  xaxis: { ...axis(theme), type: 'log', title: { text: 'Pore radius r (nm)' }, range: [0, 3] },
                  yaxis: { ...axis(theme), type: 'log', title: { text: '|P<sub>c</sub>| (MPa)' }, range: Y_RANGE },
                  shapes,
                  annotations,
                }}
                config={staticConfig}
                useResizeHandler
                className="plot"
              />
            </div>
          </div>
        </div>

        <div className="figure-controls hero-controls">
          <div className="model-control">
            <span className="control-label">Liquid</span>
            <Segmented
              label="Liquid"
              value={liquidId}
              onChange={switchLiquid}
              options={[
                { value: 'water', label: 'Water' },
                { value: 'mercury', label: 'Mercury' },
              ]}
            />
          </div>
          <LogSlider
            id="r"
            label={<>Pore radius <em>r</em> (nm)</>}
            range={R_RANGE}
            value={r}
            onChange={setR}
            hint="micro < 2 nm < meso < 50 nm < macro"
          />
          <Slider
            id="theta"
            label={<>Contact angle <em>θ</em></>}
            value={`${Math.round(theta)}°`}
            min={THETA_RANGE[0]}
            max={THETA_RANGE[1]}
            step={1}
            pos={theta}
            onChange={setTheta}
            className={theta > 90 ? 'warn' : undefined}
            hint={theta < 90 ? 'θ < 90°: wetting, liquid is pulled in' : theta > 90 ? 'θ > 90°: non-wetting, must be pushed in' : 'θ = 90°: flat meniscus'}
          />
          <div className="sim-buttons">
            <button type="button" className="button" onClick={() => setPaused((p) => !p)}>
              {paused ? 'Play' : 'Pause'}
            </button>
            <button
              type="button"
              className="button"
              onClick={() => restart(true)}
              title="Show the column at its equilibrium height for the current setting"
            >
              Jump to equilibrium
            </button>
            <button type="button" className="button" onClick={reset}>
              Reset
            </button>
          </div>
        </div>
        <p className="insight" aria-live="polite">
          {insight(r, theta, liquid)}
        </p>
        <figcaption>
          <span className="figure-label">Figure 1.</span> Left: one pore dipped in {liquid.name}; the column climbs or
          sinks to its equilibrium height (schematic, not to scale; Jurin heights in nanopores are kilometres). Right: |P<sub>c</sub>| against r on log–log axes; the dot is the current pore. Blue: wetting (pulled
          in); orange: non-wetting (pushed in). Shaded: mesopores.
        </figcaption>
      </figure>

      <section className="section iso-text" aria-labelledby="seeing-title">
        <h2 id="seeing-title" className="section-title">
          What you are seeing
        </h2>
        <p>
          <strong className="lang-ink">Wetting (θ &lt; 90°):</strong> the water spreads up the wall, so the meniscus is
          concave. The pressure in the liquid under it is lower than in the vapour, and the pore sucks water up until
          the column’s weight balances P<sub>c</sub>.
        </p>
        <p>
          <strong className="bet-ink">Non-wetting (θ &gt; 90°):</strong> the meniscus bulges up and the column is pushed
          below the reservoir. The liquid only enters if you apply more than |P<sub>c</sub>|, the breakthrough pressure.
        </p>
      </section>

      <Equations />

      <TryThis onApply={applyPreset} />

      <Condensation r={r} setR={setR} theta={theta} liquid={liquid} theme={theme} />

      <section className="section" aria-labelledby="why-title">
        <h2 id="why-title" className="section-title">
          Why it matters
        </h2>
        <ul className="why-list">
          <li>
            <strong>Fuel-cell flooding.</strong> Product water fills the small hydrophilic pores of the catalyst layer
            first. Flooded pores block O<sub>2</sub> from reaching the Pt.
          </li>
          <li>
            <strong>Gas diffusion layers.</strong> PTFE makes the carbon paper non-wetting (θ ≈ 110–140°), so water
            enters only its largest pores, above the breakthrough pressure, and leaves the rest open for gas.
          </li>
          <li>
            <strong>Electrolysers.</strong> Porous transport layers must wick water to the catalyst while letting
            O<sub>2</sub> bubbles out: pore size and θ set both.
          </li>
          <li>
            <strong>Pore sizing.</strong> Mercury porosimetry (θ ≈ 140°) pushes mercury in at rising pressure and
            converts each pressure to a radius with eq. (1).
          </li>
        </ul>
      </section>
    </article>
  )
}
