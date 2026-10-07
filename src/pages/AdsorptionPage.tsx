import { useEffect, useMemo, useRef, useState } from 'react'
import type { Annotation, Data, Shape } from 'plotly.js'
import Plot from '../components/Plot'
import SurfaceView, { N_SITES, type SurfaceStats } from '../components/SurfaceView'
import { LogSlider, Segmented, Slider } from '../components/Controls'
import { useThemeColors } from '../lib/themeColors'
import { axis, baseLayout, staticConfig } from '../lib/plotTheme'
import {
  betLoading,
  BET_FIT_RANGE,
  C_DEFAULT,
  C_RANGE,
  K_DEFAULT,
  K_RANGE,
  kneeX,
  langmuirTheta,
  SAMPLE_DEFAULT,
  siteHeightSd,
  stackShares,
  type Model,
} from '../lib/adsorption'
import { insight } from './adsorption/insight'
import TryThis, { type Preset } from './adsorption/TryThis'
import Equations from './adsorption/Equations'
import SurfaceArea from './adsorption/SurfaceArea'
import BeyondBet from './adsorption/BeyondBet'

const X_MAX = 0.95
// 0–3 layers shows the Langmuir plateau and the BET knee; 0–25 shows the BET rise near p₀.
// Points above the range get an "off scale" marker.
const Y_RANGES = { knee: 3, full: 25 } as const
type YRange = keyof typeof Y_RANGES
const N_POINTS = 300
const X_DEFAULT = 0.3
const SETTLE_MIN_TIME = 3 // simulated s at a setting (one averaging window) before it can count as settled
// Far from equilibrium (e.g. near p₀, or after the pressure drops to 0, where strongly bound first-layer
// molecules take ~C/RATE ≈ 30 s or longer to leave) the simulation runs faster until it catches up:
// ×16 after 1 simulated s at a setting (so dragging stays real-time), ×64 after 30 s.
const fastForwardSpeed = (elapsed: number) => (elapsed < 1 ? 1 : elapsed < 30 ? 16 : 64)

const EMPTY_STATS: SurfaceStats = { occupied: 0, total: 0, tallest: 0, heights: [0, 0, 0, 0], avgLoading: 0, time: 0 }
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

const LEGEND = [
  { color: 'var(--layer-1)', label: 'layer 1 (on the solid)' },
  { color: 'var(--layer-2)', label: 'layer 2' },
  { color: 'var(--layer-3)', label: 'layer 3+' },
  { color: 'var(--gas)', label: 'gas molecule' },
]

/**
 * "settling…" after a reset or any change of setting, until the simulation's running average has had at
 * least SETTLE_MIN_TIME of simulated time and comes within `tol` of the equation. Then the simulation
 * diamond is drawn on the isotherm; any change hides it until the next settle.
 */
function useSettled(key: string, stats: SurfaceStats, target: number, tol: number) {
  const start = useRef({ key, time: stats.time })
  if (start.current.key !== key) start.current = { key, time: stats.time }
  const [settledKey, setSettledKey] = useState('')
  const elapsed = stats.time - start.current.time
  const near = Math.abs(stats.avgLoading - target) <= tol
  const ready = near && elapsed >= SETTLE_MIN_TIME
  useEffect(() => {
    if (ready && settledKey !== key) setSettledKey(key)
  }, [ready, settledKey, key])
  return { settled: settledKey === key, near, elapsed }
}

interface ReadoutProps {
  model: Model
  cov: number
  stats: SurfaceStats
  status: 'settled' | 'settling' | 'fast'
  speed: number
}

function Readout({ model, cov, stats, status, speed }: ReadoutProps) {
  return (
    <div className="coverage">
      <span className="coverage-label">
        Coverage <em>θ</em> = <em>V</em>/<em>V</em>
        <sub>m</sub>
        {model === 'bet' && <span className="coverage-note"> (layers’ worth; can exceed 1 in BET)</span>}
      </span>
      <span className={`coverage-value ${model}`}>{cov.toFixed(2)}</span>
      <span className="coverage-sub">
        equation: {cov.toFixed(2)} · simulation (running average): {stats.avgLoading.toFixed(2)}{' '}
        <span
          className={`tag sim-status${status === 'settled' ? ' accent' : ''}`}
          role="status"
          title={status === 'fast' ? 'Far from equilibrium: the simulation runs faster until it catches up' : undefined}
        >
          {status === 'settled' ? 'settled' : status === 'fast' ? `fast-forward ×${speed}` : 'settling…'}
        </span>
      </span>
    </div>
  )
}

const STACK_ROWS = ['bare', '1 layer', '2 layers', '3+ layers']
const STACK_COLORS = ['var(--solid)', 'var(--layer-1)', 'var(--layer-2)', 'var(--layer-3)']

/** Share of sites by stack height: bar = simulation now, tick = equation. */
function StackBars({ model, heights, shares }: { model: Model; heights: SurfaceStats['heights']; shares: number[] }) {
  const n = heights.reduce((a, b) => a + b, 0) || 1
  const pct = (v: number) => `${Math.round(v * 100)} %`
  return (
    <div className="stack-bars">
      <p className="stack-title">
        Sites by stack height <span>(bar: simulation now · tick: equation)</span>
      </p>
      <ul>
        {STACK_ROWS.map((label, i) => {
          const blocked = model === 'langmuir' && i >= 2
          const sim = heights[i] / n
          return (
            <li key={label} className={blocked ? 'blocked' : undefined}>
              <span className="stack-label">{label}</span>
              <span className="stack-track" aria-hidden="true">
                <span className="stack-fill" style={{ width: pct(sim), background: STACK_COLORS[i] }} />
                {!blocked && <span className="stack-tick" style={{ left: pct(shares[i]) }} />}
              </span>
              <span className="stack-value">
                {blocked ? 'not allowed' : `${pct(sim)} (eq. ${pct(shares[i])})`}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default function AdsorptionPage() {
  const [x, setX] = useState(X_DEFAULT)
  const [mode, setMode] = useState<Model>('bet')
  const [runId, setRunId] = useState(0) // bump to restart the simulation (it starts at equilibrium)
  const [K, setK] = useState(K_DEFAULT)
  const [c, setC] = useState(C_DEFAULT)
  const [paused, setPaused] = useState(prefersReducedMotion)
  const [yRange, setYRange] = useState<YRange>('knee')
  const yMax = Y_RANGES[yRange]
  const [sampleId, setSampleId] = useState(SAMPLE_DEFAULT)
  const [stats, setStats] = useState<SurfaceStats>(EMPTY_STATS)
  const theme = useThemeColors()
  const COLORS = { langmuir: theme.data1, bet: theme.data2, ink: theme.text, muted: theme.muted }

  const cov = mode === 'langmuir' ? langmuirTheta(x, K) : betLoading(x, c)
  // "Agrees with the equation" means within the statistical noise of a 24-site surface (or 5 %).
  const tol = Math.max(0.05 * cov, 0.02, (0.5 * siteHeightSd(mode, x, K, c)) / Math.sqrt(N_SITES))
  const { settled, near, elapsed } = useSettled(`${runId}|${mode}|${mode === 'langmuir' ? K : c}|${x}`, stats, cov, tol)
  const speed = settled || near || paused ? 1 : fastForwardSpeed(elapsed)
  const fast = speed > 1

  const restart = () => {
    setStats(EMPTY_STATS)
    setRunId((r) => r + 1)
  }

  const reset = () => {
    setX(X_DEFAULT)
    setK(K_DEFAULT)
    setC(C_DEFAULT)
    restart()
  }

  const switchMode = (m: Model) => {
    if (m === mode) return
    setMode(m)
    restart() // pressure, K and C are kept so the models can be compared at the same setting
  }

  const applyPreset = (p: Preset) => {
    if (p.mode) setMode(p.mode)
    if (p.x !== undefined) setX(p.x)
    if (p.K !== undefined) setK(p.K)
    if (p.c !== undefined) setC(p.c)
    setPaused(false)
    restart()
    document.getElementById(p.target)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // ---------- Isotherm ----------
  const curves = useMemo(() => {
    const xs: number[] = []
    const lang: number[] = []
    const bet: number[] = []
    for (let i = 0; i <= N_POINTS; i++) {
      const xi = (i / N_POINTS) * X_MAX
      xs.push(xi)
      lang.push(langmuirTheta(xi, K))
      bet.push(betLoading(xi, c))
    }
    return { xs, lang, bet }
  }, [K, c])

  const showKnee = mode === 'bet' && c >= 2
  const curveStyle = (m: Model) => (mode === m ? { color: COLORS[m], width: 3 } : { color: COLORS[m], width: 1.75 })

  // The legend is drawn in HTML above the plot (not by Plotly), so the plot area keeps its size when the
  // simulation diamond or point B appears or disappears.
  const isoData: Data[] = [
    ...(['langmuir', 'bet'] as Model[]).map(
      (m): Data => ({
        x: curves.xs,
        y: m === 'langmuir' ? curves.lang : curves.bet,
        type: 'scatter',
        mode: 'lines',
        // Langmuir dotted, BET solid: the two curves differ by more than colour.
        line: { ...curveStyle(m), dash: m === 'langmuir' ? 'dot' : 'solid' },
        opacity: mode === m ? 1 : 0.6,
      }),
    ),
    {
      x: [x],
      y: [cov],
      type: 'scatter',
      mode: 'markers',
      marker: { size: 12, color: COLORS[mode], line: { color: theme.plotBg, width: 2 } },
    },
    {
      x: settled ? [x] : [],
      y: settled ? [cov] : [],
      type: 'scatter',
      mode: 'markers',
      marker: { size: 8, symbol: 'diamond', color: theme.plotBg, line: { color: COLORS.ink, width: 1.5 } },
    },
    {
      x: showKnee ? [kneeX(c)] : [],
      y: showKnee ? [1] : [],
      type: 'scatter',
      mode: 'markers',
      marker: { size: 10, symbol: 'circle-open', color: COLORS.ink, line: { width: 2 } },
    },
  ]

  const isoShapes: Partial<Shape>[] = [
    {
      type: 'rect',
      xref: 'x',
      yref: 'paper',
      x0: BET_FIT_RANGE[0],
      x1: BET_FIT_RANGE[1],
      y0: 0,
      y1: 1,
      layer: 'below',
      fillcolor: theme.data2Soft,
      line: { width: 0 },
    },
    { type: 'line', xref: 'paper', x0: 0, x1: 1, y0: 1, y1: 1, line: { color: COLORS.muted, width: 1.2, dash: 'dash' } },
    // p = p₀: the BET loading diverges here (the gas condenses).
    { type: 'line', xref: 'x', yref: 'paper', x0: 1, x1: 1, y0: 0, y1: 1, line: { color: COLORS.bet, width: 1.2, dash: 'dot' } },
  ]

  const isoAnnotations: Partial<Annotation>[] = [
    {
      xref: 'x',
      yref: 'paper',
      x: (BET_FIT_RANGE[0] + BET_FIT_RANGE[1]) / 2,
      y: 1,
      yanchor: 'top',
      yshift: -2,
      text: 'BET fit range',
      showarrow: false,
      font: { size: 11, color: COLORS.bet },
    },
    {
      xref: 'paper',
      x: 0.96,
      y: 1,
      xanchor: 'right',
      yanchor: 'bottom',
      yshift: 2,
      text: 'one monolayer (Vₘ)',
      showarrow: false,
      font: { size: 11, color: COLORS.muted },
    },
    {
      xref: 'x',
      yref: 'paper',
      x: 1,
      y: 1,
      xanchor: 'right',
      yanchor: 'top',
      xshift: -2,
      textangle: -90,
      text: 'p₀: V → ∞',
      showarrow: false,
      font: { size: 11, color: COLORS.bet },
    },
    // A marker above the visible range is pinned to the top edge with its value.
    ...(cov > yMax
      ? [
          {
            x,
            y: yMax,
            yanchor: 'top' as const,
            xanchor: x > 0.8 ? ('right' as const) : ('left' as const),
            xshift: x > 0.8 ? -6 : 6,
            text: `▲ ${cov.toFixed(1)} (off scale)`,
            showarrow: false,
            font: { size: 12, color: COLORS[mode] },
          },
        ]
      : []),
  ]

  const plotLabel =
    `Isotherm plot, relative pressure 0 to 1 against V over Vm, 0 to ${yMax}. ${mode === 'langmuir' ? 'Langmuir' : 'BET'} ` +
    `at p/p₀ ${x.toFixed(2)}: ${cov.toFixed(2)}` +
    (showKnee ? `. Knee B at p/p₀ ${kneeX(c).toFixed(2)}.` : '.')

  return (
    <article className="page">
      <header className="page-intro compact">
        <a className="back-link" href="#/">
          ← All tools
        </a>
        <h1>Langmuir vs BET Adsorption</h1>
        <p className="lede">
          Gas molecules adsorbing on a solid. Raise the pressure and watch the Langmuir surface fill up to a single
          layer, while in BET molecules keep stacking into multilayers. Then turn the isotherm into a surface area in
          m²/g, the number used to compare fuel-cell and electrolyzer catalysts.
        </p>
      </header>

      {/* ---------- Hero: molecular view + isotherm ---------- */}
      <figure id="sim-figure" className="figure hero" aria-label="Molecular view and isotherm">
        <div className="hero-head">
          <Readout model={mode} cov={cov} stats={stats} status={settled ? 'settled' : fast ? 'fast' : 'settling'} speed={speed} />
          <ul className="layer-legend" aria-label="Legend">
            {LEGEND.map((l) => (
              <li key={l.label}>
                <span className="dot" style={{ background: l.color }} /> {l.label}
              </li>
            ))}
            <li>
              <span className="dash" /> one monolayer (ML)
            </li>
          </ul>
        </div>

        <div className="sim-grid">
          <div className="sim-col">
            <SurfaceView
              key={runId}
              mode={mode}
              pressure={x}
              K={K}
              c={c}
              paused={paused}
              speed={speed}
              onStats={setStats}
              label={
                mode === 'langmuir'
                  ? `Langmuir surface: ${stats.occupied} of ${N_SITES} sites occupied, single layer`
                  : `BET surface: ${stats.total} molecules on ${N_SITES} sites, up to ${stats.tallest} layers`
              }
            />
            <StackBars model={mode} heights={stats.heights} shares={stackShares(mode, x, K, c)} />
          </div>
          <div className="plot-col">
            <ul className="plot-legend" aria-label="Plot legend">
              <li>
                <span className="key-line" style={{ borderColor: COLORS.langmuir, borderTopStyle: 'dotted' }} /> Langmuir θ
              </li>
              <li>
                <span className="key-line" style={{ borderColor: COLORS.bet }} /> BET V/V<sub>m</sub>
              </li>
              <li>
                <span className="key-mark">◇</span> simulation (settled)
              </li>
              <li>
                <span className="key-mark">○</span> B: one monolayer’s worth (V = V<sub>m</sub>)
              </li>
            </ul>
            <div role="img" aria-label={plotLabel}>
              <Plot
                data={isoData}
                layout={{
                  ...baseLayout(theme),
                  showlegend: false,
                  xaxis: { ...axis(theme), title: { text: 'Relative pressure p/p₀' }, range: [0, 1] },
                  yaxis: { ...axis(theme), title: { text: 'θ = V/V<sub>m</sub>  (layers)' }, range: [0, yMax] },
                  shapes: isoShapes,
                  annotations: isoAnnotations,
                }}
                config={staticConfig}
                useResizeHandler
                className="plot"
              />
            </div>
            <div className="plot-zoom">
              <span className="control-label">y-axis</span>
              <Segmented
                label="y-axis range"
                value={yRange}
                onChange={setYRange}
                options={[
                  { value: 'knee', label: '0–3 layers' },
                  { value: 'full', label: `0–${Y_RANGES.full} layers` },
                ]}
              />
            </div>
          </div>
        </div>

        <div className="figure-controls hero-controls">
          <div className="model-control">
            <span className="control-label">
              Model
            </span>
            <Segmented
              label="Model"
              value={mode}
              onChange={switchMode}
              options={[
                { value: 'langmuir', label: 'Langmuir', activeClass: 'lang' },
                { value: 'bet', label: 'BET', activeClass: 'bet' },
              ]}
            />
          </div>
          <Slider
            id="x"
            label={<>Pressure p/p₀</>}
            value={x.toFixed(2)}
            min={0}
            max={X_MAX}
            step={0.01}
            pos={x}
            onChange={setX}
            hint="relative to the saturation pressure p₀"
          />
          {mode === 'langmuir' ? (
            <LogSlider
              id="K"
              label={<>Langmuir constant <em>K</em></>}
              range={K_RANGE}
              value={K}
              onChange={setK}
              hint="larger K = stronger binding, fills at lower p/p₀"
            />
          ) : (
            <LogSlider
              id="c"
              label={<>BET constant <em>C</em></>}
              range={C_RANGE}
              value={c}
              onChange={setC}
              hint={c < 2 ? 'C < 2: type III, weak first layer, no knee' : 'larger C = sharper knee (type II)'}
            />
          )}
          <div className="sim-buttons">
            <button type="button" className="button" onClick={() => setPaused((p) => !p)}>
              {paused ? 'Play' : 'Pause'}
            </button>
            <button
              type="button"
              className="button"
              onClick={restart}
              disabled={settled}
              title="Restart the simulation at equilibrium for the current setting"
            >
              Jump to equilibrium
            </button>
            <button type="button" className="button" onClick={reset}>
              Reset
            </button>
          </div>
        </div>
        <p className="insight" aria-live="polite">
          {insight(mode, x, K, c)}
        </p>
        <figcaption>
          <span className="figure-label">Figure 1.</span> Left: the surface in cross-section. Right: the isotherm. The
          dot is the current pressure; the diamond appears once the simulation has settled on it (far from
          equilibrium it fast-forwards). B marks one monolayer’s worth adsorbed, V = V<sub>m</sub>; even there some
          sites are still bare and some already two deep (see the bars). The shaded band is the BET fit range.
        </figcaption>
      </figure>

      <TryThis onApply={applyPreset} />

      <section className="section iso-text" aria-labelledby="seeing-title">
        <h2 id="seeing-title" className="section-title">
          What you are seeing
        </h2>
        <p>
          <strong className="lang-ink">Langmuir:</strong> each site holds at most one molecule, and molecules ignore
          their neighbours. As p/p₀ rises the free sites run out, and the curve levels off at θ = V/V<sub>m</sub> = 1,
          a full monolayer.
        </p>
        <p>
          <strong className="bet-ink">BET:</strong> molecules can also land on top of adsorbed ones. The first layer
          sits on the solid and is bound more strongly (in the animation it rarely leaves), while upper layers behave
          like a liquid and exchange with the gas often. That difference in binding makes the knee: the first layer
          fills quickly, then the curve flattens at point B. As p/p₀ → 1 the stacks keep growing: the gas condenses on
          the surface.
        </p>
      </section>

      <Equations mode={mode} />

      <SurfaceArea c={c} setC={setC} sampleId={sampleId} setSampleId={setSampleId} theme={theme} />

      <BeyondBet />

      <section className="section" aria-labelledby="why-title">
        <h2 id="why-title" className="section-title">
          Why it matters for clean energy
        </h2>
        <ul className="why-list">
          <li>
            <strong>Fuel-cell catalysts.</strong> H<sub>2</sub> oxidation and O<sub>2</sub> reduction on Pt run
            through adsorbed intermediates. Rate laws such as Langmuir–Hinshelwood are written in terms of the
            Langmuir coverage θ of each species. CO binds far more strongly (very large K), so even a few ppm take
            over the sites: CO poisoning.
          </li>
          <li>
            <strong>Catalyst layers and electrodes.</strong> The BET area of a carbon support (Vulcan ~240 m²/g,
            Ketjenblack ~800 m²/g) sets how finely Pt can be spread, and for scarce Ir in electrolyzer anodes the area
            per gram is a cost lever. Battery and supercapacitor electrodes are compared the same way.
          </li>
          <li>
            <strong>Hydrogen storage.</strong> H<sub>2</sub> is above its critical temperature (33 K) even at 77 K,
            so it cannot condense or build multilayers. MOFs and activated carbons store it by filling micropores, a
            type I, Langmuir-like isotherm. Uptake grows roughly with BET area: about 1 wt% per 500 m²/g at 77 K.
          </li>
          <li>
            <strong>CO<sub>2</sub> capture.</strong> Zeolites, MOFs and amine sorbents take CO<sub>2</sub> from flue
            gas or air. The working capacity is the difference between the uptake at adsorption and at regeneration
            conditions, read straight off the isotherm (often fitted with Langmuir or dual-site Langmuir).
          </li>
        </ul>
      </section>
    </article>
  )
}
