import { useMemo, useState } from 'react'
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
  type Model,
} from '../lib/adsorption'
import { insight } from './adsorption/insight'
import TryThis, { type Preset } from './adsorption/TryThis'
import Equations from './adsorption/Equations'
import SurfaceArea from './adsorption/SurfaceArea'
import BeyondBet from './adsorption/BeyondBet'

const X_MAX = 0.95
const Y_MAX = 3 // 0–3 layers shows the Langmuir plateau and the BET knee; higher points get an "off scale" marker
const N_POINTS = 300
const X_DEFAULT = 0.3

const EMPTY_STATS: SurfaceStats = { occupied: 0, total: 0, tallest: 0, avgLoading: 0, time: 0 }
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

const LEGEND = [
  { color: 'var(--layer-1)', label: 'layer 1 (on the solid)' },
  { color: 'var(--layer-2)', label: 'layer 2' },
  { color: 'var(--layer-3)', label: 'layer 3+' },
  { color: 'var(--gas)', label: 'gas molecule' },
]

function Readout({ model, cov, stats }: { model: Model; cov: number; stats: SurfaceStats }) {
  return (
    <div className="coverage">
      <span className="coverage-label">
        {model === 'langmuir' ? (
          <>
            Coverage <em>θ</em> = <em>V</em>/<em>V</em>
            <sub>m</sub>
          </>
        ) : (
          <>
            Loading <em>V</em>/<em>V</em>
            <sub>m</sub>
            <span className="coverage-note"> (can exceed 1)</span>
          </>
        )}
      </span>
      <span className={`coverage-value ${model}`}>{cov.toFixed(2)}</span>
      <span className="coverage-sub">
        equation {cov.toFixed(2)} · simulation {stats.avgLoading.toFixed(2)}
      </span>
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
  const [sampleId, setSampleId] = useState(SAMPLE_DEFAULT)
  const [stats, setStats] = useState<SurfaceStats>(EMPTY_STATS)
  const theme = useThemeColors()
  const COLORS = { langmuir: theme.data1, bet: theme.data2, ink: theme.text, muted: theme.muted }

  const cov = mode === 'langmuir' ? langmuirTheta(x, K) : betLoading(x, c)

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

  // The legend is drawn in HTML above the plot (not by Plotly), so the plot area keeps its size when
  // point B appears or disappears.
  const isoData: Data[] = [
    ...(['langmuir', 'bet'] as Model[]).map(
      (m): Data => ({
        x: curves.xs,
        y: m === 'langmuir' ? curves.lang : curves.bet,
        type: 'scatter',
        mode: 'lines',
        line: curveStyle(m),
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
      // Top corner, clear of the Langmuir curve, which ends just below V = Vm at the right edge.
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
    ...(cov > Y_MAX
      ? [
          {
            x,
            y: Y_MAX,
            yanchor: 'top' as const,
            xanchor: x > 0.85 ? ('right' as const) : ('left' as const),
            xshift: x > 0.85 ? -6 : 6,
            text: `▲ ${cov.toFixed(1)}`,
            showarrow: false,
            font: { size: 12, color: COLORS[mode] },
          },
        ]
      : []),
  ]

  const plotLabel =
    `Isotherm plot, relative pressure 0 to 1 against V over Vm, 0 to ${Y_MAX} monolayers. ${mode === 'langmuir' ? 'Langmuir' : 'BET'} ` +
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
          Gas molecules sticking to a solid. Langmuir stops at one layer; BET keeps stacking. Then turn the curve into
          a surface area in m²/g.
        </p>
      </header>

      {/* ---------- Hero: molecular view + isotherm ---------- */}
      <figure id="sim-figure" className="figure hero" aria-label="Molecular view and isotherm">
        <div className="hero-head">
          <Readout model={mode} cov={cov} stats={stats} />
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
          <SurfaceView
            key={runId}
            mode={mode}
            pressure={x}
            K={K}
            c={c}
            paused={paused}
            onStats={setStats}
            label={
              mode === 'langmuir'
                ? `Langmuir surface: ${stats.occupied} of ${N_SITES} sites occupied, single layer`
                : `BET surface: ${stats.total} molecules on ${N_SITES} sites, up to ${stats.tallest} layers`
            }
          />
          <div className="plot-col">
            <ul className="plot-legend" aria-label="Plot legend">
              <li>
                <span className="key-line" style={{ borderColor: COLORS.langmuir }} /> Langmuir θ
              </li>
              <li>
                <span className="key-line" style={{ borderColor: COLORS.bet }} /> BET V/V<sub>m</sub>
              </li>
              <li>
                <span className="key-mark">○</span> B: one monolayer (V = V<sub>m</sub>)
              </li>
            </ul>
            <div role="img" aria-label={plotLabel}>
              <Plot
                data={isoData}
                layout={{
                  ...baseLayout(theme),
                  showlegend: false,
                  xaxis: { ...axis(theme), title: { text: 'Relative pressure p/p₀' }, range: [0, 1] },
                  yaxis: { ...axis(theme), title: { text: 'V/V<sub>m</sub>  (monolayers)' }, range: [0, Y_MAX] },
                  shapes: isoShapes,
                  annotations: isoAnnotations,
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
            hint="p₀ = saturation pressure"
          />
          {/* Both constants stay adjustable, since both curves are always drawn; the other model's is dimmed. */}
          <LogSlider
            id="K"
            label={<>Langmuir constant <em>K</em></>}
            range={K_RANGE}
            value={K}
            onChange={setK}
            className={mode === 'langmuir' ? undefined : 'inactive'}
            hint={
              mode === 'langmuir'
                ? 'K = K′p₀; higher K = stronger binding'
                : 'sets the faded Langmuir curve'
            }
          />
          <LogSlider
            id="c"
            label={<>BET constant <em>C</em></>}
            range={C_RANGE}
            value={c}
            onChange={setC}
            className={[mode === 'bet' ? '' : 'inactive', c < 2 ? 'warn' : ''].join(' ').trim() || undefined}
            hint={
              c < 2
                ? 'C < 2: no knee (type III)'
                : mode === 'bet'
                  ? 'higher C = sharper knee'
                  : 'sets the faded BET curve'
            }
          />
          <div className="sim-buttons">
            <button type="button" className="button" onClick={() => setPaused((p) => !p)}>
              {paused ? 'Play' : 'Pause'}
            </button>
            <button
              type="button"
              className="button"
              onClick={restart}
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
          <span className="figure-label">Figure 1.</span> Left: the surface. Right: the isotherm; the dot is the
          current pressure (▲ if off the top). After a big change the simulation lags; Jump to equilibrium catches it
          up. B is where V = V<sub>m</sub> (the knee, for large C). Shaded: BET fit range.
        </figcaption>
      </figure>

      <section className="section iso-text" aria-labelledby="seeing-title">
        <h2 id="seeing-title" className="section-title">
          What you are seeing
        </h2>
        <p>
          <strong className="lang-ink">Langmuir:</strong> one molecule per site. The sites run out, so the curve levels
          off at θ = 1, one full layer.
        </p>
        <p>
          <strong className="bet-ink">BET:</strong> molecules also stack on each other. The first layer binds more
          strongly, so it fills first: that is the knee at B. Near p₀ the gas condenses and the stacks keep growing.
        </p>
      </section>

      <Equations mode={mode} />

      <TryThis onApply={applyPreset} />

      <SurfaceArea c={c} setC={setC} sampleId={sampleId} setSampleId={setSampleId} theme={theme} />

      <BeyondBet />

      <section className="section" aria-labelledby="why-title">
        <h2 id="why-title" className="section-title">
          Why it matters
        </h2>
        <ul className="why-list">
          <li>
            <strong>Fuel cells.</strong> Reactions on Pt go through adsorbed species, described by the Langmuir θ. CO
            binds very strongly (huge K), so a few ppm block the sites.
          </li>
          <li>
            <strong>Electrodes.</strong> More BET area (Vulcan ~240, Ketjenblack ~800 m²/g) spreads Pt and Ir
            thinner, so less metal does the job.
          </li>
          <li>
            <strong>H<sub>2</sub> storage.</strong> H<sub>2</sub> cannot condense at 77 K, so MOFs and carbons store
            it in micropores (type I). Rule of thumb: ~1 wt% per 500 m²/g.
          </li>
          <li>
            <strong>CO<sub>2</sub> capture.</strong> A sorbent's working capacity is its uptake at adsorption minus
            its uptake at regeneration, read off the isotherm.
          </li>
        </ul>
      </section>
    </article>
  )
}
