import { useEffect, useMemo, useRef, useState } from 'react'
import type { Annotation, Data, Shape } from 'plotly.js'
import Plot from '../components/Plot'
import SurfaceView, { N_SITES, type SurfaceStats } from '../components/SurfaceView'
import { LogSlider, Segmented, Slider } from '../components/Controls'
import { useThemeColors } from '../lib/themeColors'
import { axis, baseLayout, staticConfig } from '../lib/plotTheme'
import {
  AREA_PER_VM,
  betLoading,
  BET_FIT_RANGE,
  C_DEFAULT,
  C_RANGE,
  K_DEFAULT,
  K_RANGE,
  kneeX,
  langmuirTheta,
  loading,
  SAMPLES,
  SAMPLE_DEFAULT,
  type Model,
} from '../lib/adsorption'
import { insight, type View } from './adsorption/insight'
import TryThis, { type Preset } from './adsorption/TryThis'
import Equations from './adsorption/Equations'
import SurfaceArea from './adsorption/SurfaceArea'
import BeyondBet from './adsorption/BeyondBet'

const X_MAX = 0.95
const Y_ML = 3 // "monolayer region" y-axis: 0–3 layers shows the Langmuir plateau and the BET knee
const N_POINTS = 300
const X_DEFAULT = 0.3
const SETTLE_MIN_TIME = 3 // simulated s at a setting (one averaging window) before it can count as settled

const MODEL_NAME: Record<Model, string> = { langmuir: 'Langmuir', bet: 'BET' }
const EMPTY_STATS: SurfaceStats = { occupied: 0, total: 0, tallest: 0, avgLoading: 0, time: 0 }

const LEGEND = [
  { color: 'var(--layer-1)', label: 'layer 1 (on the solid)' },
  { color: 'var(--layer-2)', label: 'layer 2' },
  { color: 'var(--layer-3)', label: 'layer 3+' },
  { color: 'var(--gas)', label: 'gas molecule' },
]

/**
 * "settling…" after a reset or any change of setting, until the simulation's running average has had at
 * least SETTLE_MIN_TIME of simulated time and comes within ~5 % of the equation. Then the simulation
 * diamond is drawn on the isotherm; any change hides it until the next settle.
 */
function useSettled(key: string, stats: SurfaceStats, target: number): boolean {
  const start = useRef({ key, time: stats.time })
  if (start.current.key !== key) start.current = { key, time: stats.time }
  const [settledKey, setSettledKey] = useState('')
  const near = Math.abs(stats.avgLoading - target) <= Math.max(0.05 * target, 0.02)
  const ready = near && stats.time - start.current.time >= SETTLE_MIN_TIME
  useEffect(() => {
    if (ready && settledKey !== key) setSettledKey(key)
  }, [ready, settledKey, key])
  return settledKey === key
}

function Readout({ model, cov, stats, settled }: { model: Model; cov: number; stats: SurfaceStats; settled: boolean }) {
  const { occupied, total, tallest } = stats
  return (
    <div className="coverage">
      <span className="coverage-label">
        {MODEL_NAME[model]}:{' '}
        {model === 'langmuir' ? (
          <>
            coverage <em>θ</em> = <em>V</em>/<em>V</em>
            <sub>m</sub>
          </>
        ) : (
          <>
            loading <em>V</em>/<em>V</em>
            <sub>m</sub>
          </>
        )}
      </span>
      <span className={`coverage-value ${model}`}>{cov.toFixed(2)}</span>
      <span className="coverage-sub">
        equation: {cov.toFixed(2)} · simulation (running average): {stats.avgLoading.toFixed(2)}{' '}
        <span className={`tag sim-status${settled ? ' accent' : ''}`} role="status">
          {settled ? 'settled' : 'settling…'}
        </span>
        <br />
        {model === 'langmuir'
          ? `${occupied} of ${N_SITES} sites occupied · 1 layer max`
          : `${total} molecules on ${N_SITES} sites · ${N_SITES - occupied} bare · up to ${tallest} layer${tallest === 1 ? '' : 's'}`}
      </span>
    </div>
  )
}

export default function AdsorptionPage() {
  const [x, setX] = useState(X_DEFAULT)
  const [view, setView] = useState<View>('bet')
  const [runId, setRunId] = useState(0) // bump to restart the simulation (it starts at equilibrium)
  const [K, setK] = useState(K_DEFAULT)
  const [c, setC] = useState(C_DEFAULT)
  const [paused, setPaused] = useState(false)
  const [yRange, setYRange] = useState<'ml' | 'full'>('ml')
  const [units, setUnits] = useState<'rel' | 'abs'>('rel')
  const [sampleId, setSampleId] = useState(SAMPLE_DEFAULT)
  const [stats, setStats] = useState<Record<Model, SurfaceStats>>({ langmuir: EMPTY_STATS, bet: EMPTY_STATS })
  const theme = useThemeColors()
  const COLORS = { langmuir: theme.data1, bet: theme.data2, ink: theme.text, muted: theme.muted }

  const models: Model[] = view === 'both' ? ['langmuir', 'bet'] : [view]
  const shows = (m: Model) => models.includes(m)
  const cov: Record<Model, number> = { langmuir: langmuirTheta(x, K), bet: betLoading(x, c) }
  const settled: Record<Model, boolean> = {
    langmuir: useSettled(`${runId}|${view}|${K}|${x}`, stats.langmuir, cov.langmuir),
    bet: useSettled(`${runId}|${view}|${c}|${x}`, stats.bet, cov.bet),
  }

  const sample = SAMPLES.find((s) => s.id === sampleId) ?? SAMPLES[0]
  const u = units === 'abs' ? sample.area / AREA_PER_VM : 1 // y scale: V/Vm → cm³(STP)/g

  const restart = () => {
    setStats({ langmuir: EMPTY_STATS, bet: EMPTY_STATS })
    setRunId((r) => r + 1)
  }

  const reset = () => {
    setX(X_DEFAULT)
    setK(K_DEFAULT)
    setC(C_DEFAULT)
    setYRange('ml')
    setUnits('rel')
    restart()
  }

  const switchView = (v: View) => {
    if (v === view) return
    setView(v)
    restart() // pressure, K and C are kept so the models can be compared at the same setting
  }

  const applyPreset = (p: Preset) => {
    if (p.view) setView(p.view)
    if (p.x !== undefined) setX(p.x)
    if (p.K !== undefined) setK(p.K)
    if (p.c !== undefined) setC(p.c)
    if (p.yRange) setYRange(p.yRange)
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

  const yMax = (yRange === 'ml' ? Y_ML : Math.max(1.1, ...models.map((m) => loading(m, X_MAX, K, c))) * 1.05) * u
  const scaled = (v: number) => v * u
  const showKnee = shows('bet') && c >= 2

  const curveStyle = (m: Model) => (shows(m) ? { color: COLORS[m], width: 3 } : { color: COLORS[m], width: 1.75 })

  const isoData: Data[] = [
    ...(['langmuir', 'bet'] as Model[]).map(
      (m): Data => ({
        x: curves.xs,
        y: (m === 'langmuir' ? curves.lang : curves.bet).map(scaled),
        type: 'scatter',
        mode: 'lines',
        name: m === 'langmuir' ? 'Langmuir θ' : 'BET V/Vₘ',
        line: curveStyle(m),
        opacity: shows(m) ? 1 : 0.6,
      }),
    ),
    ...models.map(
      (m): Data => ({
        x: [x],
        y: [scaled(cov[m])],
        type: 'scatter',
        mode: 'markers',
        showlegend: false,
        marker: { size: 12, color: COLORS[m], line: { color: theme.plotBg, width: 2 } },
      }),
    ),
    {
      x: models.filter((m) => settled[m]).map(() => x),
      y: models.filter((m) => settled[m]).map((m) => scaled(cov[m])),
      type: 'scatter',
      mode: 'markers',
      name: 'simulation',
      showlegend: models.some((m) => settled[m]),
      marker: { size: 8, symbol: 'diamond', color: theme.plotBg, line: { color: COLORS.ink, width: 1.5 } },
    },
    {
      x: showKnee ? [kneeX(c)] : [],
      y: showKnee ? [u] : [],
      type: 'scatter',
      mode: 'markers',
      name: 'B: monolayer complete',
      showlegend: showKnee,
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
    { type: 'line', xref: 'paper', x0: 0, x1: 1, y0: u, y1: u, line: { color: COLORS.muted, width: 1.2, dash: 'dash' } },
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
      x: 0.99,
      y: u,
      xanchor: 'right',
      yanchor: 'bottom',
      yshift: 2,
      text: 'one monolayer (Vₘ)',
      showarrow: false,
      font: { size: 11, color: COLORS.muted },
    },
    // A marker above the visible range is pinned to the top edge with its value.
    ...models
      .filter((m) => scaled(cov[m]) > yMax)
      .map(
        (m, i): Partial<Annotation> => ({
          x,
          y: yMax,
          yanchor: 'top',
          xanchor: x > 0.8 ? 'right' : 'left',
          xshift: x > 0.8 ? -6 : 6,
          yshift: -i * 16,
          text: `▲ ${scaled(cov[m]).toFixed(1)} (off scale)`,
          showarrow: false,
          font: { size: 12, color: COLORS[m] },
        }),
      ),
  ]

  const yTitle = units === 'abs' ? 'V  [cm³(STP)/g]' : 'V/Vₘ  (layers)'
  const plotLabel =
    `Isotherm plot, relative pressure 0 to 1 against ${units === 'abs' ? 'adsorbed volume' : 'V over Vm'}. ` +
    models.map((m) => `${MODEL_NAME[m]} at p/p₀ ${x.toFixed(2)}: ${scaled(cov[m]).toFixed(2)}`).join('; ') +
    (showKnee ? `. Knee B at p/p₀ ${kneeX(c).toFixed(2)}.` : '.')

  const surface = (m: Model) => (
    <div key={m} className="surface-item">
      {view === 'both' && <p className={`surface-name ${m === 'langmuir' ? 'lang-ink' : 'bet-ink'}`}>{MODEL_NAME[m]}</p>}
      <SurfaceView
        key={`${runId}-${m}`}
        mode={m}
        pressure={x}
        K={K}
        c={c}
        paused={paused}
        onStats={(s) => setStats((prev) => ({ ...prev, [m]: s }))}
        label={
          m === 'langmuir'
            ? `Langmuir surface: ${stats.langmuir.occupied} of ${N_SITES} sites occupied, single layer`
            : `BET surface: ${stats.bet.total} molecules on ${N_SITES} sites, up to ${stats.bet.tallest} layers`
        }
      />
    </div>
  )

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
          <div className="readouts">
            {models.map((m) => (
              <Readout key={m} model={m} cov={cov[m]} stats={stats[m]} settled={settled[m]} />
            ))}
          </div>
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

        <div className={`sim-grid${view === 'both' ? ' both' : ''}`}>
          <div className="surfaces">{models.map(surface)}</div>
          <div className="plot-col">
            <div className="plot-options">
              <Segmented
                small
                label="y-axis range"
                value={yRange}
                onChange={setYRange}
                options={[
                  { value: 'ml', label: '0–3 layers' },
                  { value: 'full', label: 'Full range' },
                ]}
              />
              <Segmented
                small
                label="y-axis units"
                value={units}
                onChange={setUnits}
                options={[
                  { value: 'rel', label: 'V/Vₘ' },
                  { value: 'abs', label: 'cm³/g' },
                ]}
              />
            </div>
            <div role="img" aria-label={plotLabel}>
              <Plot
                data={isoData}
                layout={{
                  ...baseLayout(theme),
                  xaxis: { ...axis(theme), title: { text: 'Relative pressure p/p₀' }, range: [0, 1] },
                  yaxis: { ...axis(theme), title: { text: yTitle }, range: [0, yMax] },
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
              value={view}
              onChange={switchView}
              options={[
                { value: 'langmuir', label: 'Langmuir', activeClass: 'lang' },
                { value: 'bet', label: 'BET', activeClass: 'bet' },
                { value: 'both', label: 'Both' },
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
          {shows('langmuir') && (
            <LogSlider
              id="K"
              label={<>Langmuir constant <em>K</em></>}
              range={K_RANGE}
              value={K}
              onChange={setK}
              hint="larger K = stronger binding, fills at lower p/p₀"
            />
          )}
          {shows('bet') && (
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
            <button type="button" className="button" aria-pressed={paused} onClick={() => setPaused((p) => !p)}>
              {paused ? 'Play' : 'Pause'}
            </button>
            <button type="button" className="button" onClick={reset}>
              Reset
            </button>
          </div>
        </div>
        <p className="insight" aria-live="polite">
          {insight(view, x, K, c)}
        </p>
        <figcaption>
          <span className="figure-label">Figure 1.</span> Left: cross-section of the surface, with gas above and the
          adsorbent below. Right: the isotherm. The dot marks the current pressure; the simulation average should stay
          near it, and once it has settled a diamond appears on that point. The open circle B marks where one
          monolayer’s worth is adsorbed, at p/p₀ = 1/(1 + √C). The shaded band (p/p₀ 0.05–0.35) is where the BET
          equation is normally fitted.
          {units === 'abs' && ` In cm³/g the curve is scaled by Vₘ of the sample chosen in Figure 2 (${sample.name}).`}
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

      <Equations view={view} />

      <SurfaceArea c={c} setC={setC} sampleId={sampleId} setSampleId={setSampleId} theme={theme} />

      <BeyondBet x={x} />

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
            <strong>Pore structure.</strong> Type IV hysteresis and mercury porosimetry measure the pores that carry
            gas in and water out of catalyst layers and gas diffusion layers.
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
