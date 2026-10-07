import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Annotation, Data, Layout, Shape } from 'plotly.js'
import Plot from '../components/Plot'
import SurfaceView, { N_SITES, type SurfaceStats } from '../components/SurfaceView'
import Tex, { Frac } from '../components/Tex'
import Entry from '../components/Entry'
import { COURSE } from '../siteConfig'
import { useThemeColors, type ThemeColors } from '../lib/themeColors'
import { betLoading, C_DEFAULT, C_RANGE, K_DEFAULT, K_RANGE, langmuirTheta, loading, type Model } from '../lib/adsorption'

const X_MAX = 0.95
const Y_MAX = 3 // same fixed y-axis for both models: shows the Langmuir plateau and the BET knee and rise
const N_POINTS = 300
const X_DEFAULT = 0.3
const SETTLE_MIN_TIME = 3 // simulated s at a setting (one averaging window) before it can count as settled
const BET_RANGE: [number, number] = [0.05, 0.35] // usual fitting range of the BET equation

// K and c sliders move on a log scale; values are rounded to two significant figures.
const LOG_STEPS = 200
const toLogPos = (v: number, [lo, hi]: [number, number]) => (Math.log(v / lo) / Math.log(hi / lo)) * LOG_STEPS
const fromLogPos = (pos: number, [lo, hi]: [number, number]) => Number((lo * (hi / lo) ** (pos / LOG_STEPS)).toPrecision(2))
const fmtConst = (v: number) => (v < 10 ? v.toFixed(1) : String(v))

const PLOT_FONT = 'IBM Plex Mono, ui-monospace, Menlo, monospace'
const HAND_FONT = 'Caveat, Segoe Print, cursive'

const baseLayout = (t: ThemeColors): Partial<Layout> => ({
  autosize: true,
  margin: { l: 52, r: 22, t: 22, b: 44 },
  font: { family: PLOT_FONT, size: 11, color: t.text },
  paper_bgcolor: 'rgba(0,0,0,0)',
  plot_bgcolor: t.plotBg,
  hovermode: false,
  showlegend: false,
  dragmode: false,
})

// Thin axes, no gridlines: the arrowheads are added as annotations (see axisArrows).
const axis = (t: ThemeColors) => ({
  zeroline: false,
  showgrid: false,
  linecolor: t.axis,
  linewidth: 1,
  tickcolor: t.axis,
  ticklen: 4,
  showline: true,
  ticks: 'outside' as const,
  title: { font: { family: 'Source Serif 4, Georgia, serif', size: 14, color: t.text } },
})

const axisArrows = (t: ThemeColors): Partial<Annotation>[] => [
  { xref: 'paper', yref: 'paper', x: 1.035, y: 0, ax: -30, ay: 0, text: '', showarrow: true, arrowhead: 2, arrowsize: 1.1, arrowwidth: 1, arrowcolor: t.axis },
  { xref: 'paper', yref: 'paper', x: 0, y: 1.06, ax: 0, ay: 30, text: '', showarrow: true, arrowhead: 2, arrowsize: 1.1, arrowwidth: 1, arrowcolor: t.axis },
]

interface SliderProps {
  id: string
  symbol: ReactNode
  name: string
  unit: string
  value: string
  min: number
  max: number
  step: number
  pos: number
  onChange: (v: number) => void
  hint?: string
}

/** Technical slider: symbol, name and unit on the label line, numeric readout in monospace. */
function Slider({ id, symbol, name, unit, value, min, max, step, pos, onChange, hint }: SliderProps) {
  return (
    <div className="slider">
      <label htmlFor={id}>
        <span className="slider-sym">{symbol}</span>
        <span className="slider-name">{name}</span>
        <output htmlFor={id}>
          {value} <span className="unit">[{unit}]</span>
        </output>
      </label>
      <input id={id} type="range" min={min} max={max} step={step} value={pos} onChange={(e) => onChange(Number(e.target.value))} />
      {hint && <small>{hint}</small>}
    </div>
  )
}

const LEGEND = [
  { color: 'var(--layer-1)', label: 'layer 1 (on the solid)' },
  { color: 'var(--layer-2)', label: 'layer 2' },
  { color: 'var(--layer-3)', label: 'layer 3+' },
  { color: 'var(--gas)', label: 'gas' },
]

function Term({ sym, fallback, children }: { sym: string; fallback: ReactNode; children: ReactNode }) {
  return (
    <>
      <dt>
        <Tex tex={sym} fallback={fallback} />
      </dt>
      <dd>{children}</dd>
    </>
  )
}

export default function AdsorptionPage() {
  const [x, setX] = useState(X_DEFAULT)
  const [mode, setMode] = useState<Model>('bet')
  const [runId, setRunId] = useState(0) // bump to restart the animation on a clean surface
  const [K, setK] = useState(K_DEFAULT)
  const [c, setC] = useState(C_DEFAULT)
  const [paused, setPaused] = useState(false)
  const theme = useThemeColors()
  const COLORS = { langmuir: theme.data1, bet: theme.data2, ink: theme.text, muted: theme.muted }
  const [stats, setStats] = useState<SurfaceStats>({ occupied: 0, total: 0, tallest: 0, avgLoading: 0, time: 0 })
  const { occupied, total, tallest } = stats
  const cov = loading(mode, x, K, c)

  // "settling…" shows after a reset or a pressure/K/c change until the running average, after at least
  // SETTLE_MIN_TIME of simulated time, first comes within ~5%. Once settled, the simulation diamond is
  // drawn exactly on the current point of the isotherm; any change (pressure included) hides it until the next settle.
  const runKey = `${runId}|${mode}|${K}|${c}|${x}`
  const runStart = useRef({ key: runKey, time: 0 })
  if (runStart.current.key !== runKey) runStart.current = { key: runKey, time: stats.time }
  const [settledKey, setSettledKey] = useState('')
  const near = Math.abs(stats.avgLoading - cov) <= Math.max(0.05 * cov, 0.02)
  const settleReady = near && stats.time - runStart.current.time >= SETTLE_MIN_TIME
  useEffect(() => {
    if (!settleReady || settledKey === runKey) return
    setSettledKey(runKey)
  }, [settleReady, settledKey, runKey])
  const settling = settledKey !== runKey

  const restart = () => {
    setX(X_DEFAULT)
    setStats({ occupied: 0, total: 0, tallest: 0, avgLoading: 0, time: 0 })
    setRunId((r) => r + 1)
  }

  const reset = () => {
    setK(K_DEFAULT)
    setC(C_DEFAULT)
    restart()
  }

  const switchMode = (m: Model) => {
    if (m === mode) return
    setMode(m)
    restart()
  }

  // ---------- Isotherm (secondary plot) ----------
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

  const curveStyle = (m: Model) =>
    mode === m ? { color: COLORS[m], width: 2 } : { color: COLORS[m], width: 1.2, dash: 'dot' as const }

  const isoData: Data[] = [
    {
      x: curves.xs,
      y: curves.lang,
      type: 'scatter',
      mode: 'lines',
      name: 'Langmuir θ',
      line: curveStyle('langmuir'),
      opacity: mode === 'langmuir' ? 1 : 0.55,
    },
    {
      x: curves.xs,
      y: curves.bet,
      type: 'scatter',
      mode: 'lines',
      name: 'BET n/nₘ',
      line: curveStyle('bet'),
      opacity: mode === 'bet' ? 1 : 0.55,
    },
    {
      x: [x],
      y: [cov],
      type: 'scatter',
      mode: 'markers',
      marker: { size: 9, color: COLORS[mode], line: { color: theme.plotBg, width: 1.5 } },
    },
    {
      x: settling ? [] : [x],
      y: settling ? [] : [cov],
      type: 'scatter',
      mode: 'markers',
      name: 'simulation',
      marker: { size: 8, symbol: 'diamond', color: theme.plotBg, line: { color: COLORS.ink, width: 1.2 } },
    },
  ]

  const isoShapes: Partial<Shape>[] = [
    {
      type: 'rect',
      xref: 'x',
      yref: 'paper',
      x0: BET_RANGE[0],
      x1: BET_RANGE[1],
      y0: 0,
      y1: 1,
      layer: 'below',
      fillcolor: theme.data2Soft,
      line: { width: 0 },
    },
    { type: 'line', xref: 'paper', x0: 0, x1: 1, y0: 1, y1: 1, line: { color: COLORS.ink, width: 1, dash: 'dash' } },
  ]

  // Hand-written labels placed next to the curves instead of a legend box.
  const langLabelX = 0.62
  const betIdx = curves.bet.findIndex((v) => v >= 2.2)
  const betLabelX = betIdx > 0 ? curves.xs[betIdx] : 0.9
  const hand = (color: string) => ({ family: HAND_FONT, size: 17, color })
  const isoAnnotations: Partial<Annotation>[] = [
    ...axisArrows(theme),
    {
      x: langLabelX,
      y: langmuirTheta(langLabelX, K),
      yanchor: 'top',
      yshift: -6,
      text: 'Langmuir: monolayer',
      showarrow: false,
      font: hand(COLORS.langmuir),
    },
    {
      x: betLabelX,
      y: Math.min(curves.bet[betIdx > 0 ? betIdx : curves.bet.length - 1], Y_MAX * 0.9),
      xanchor: 'right',
      xshift: -8,
      text: 'BET: multilayer',
      showarrow: false,
      font: hand(COLORS.bet),
    },
    {
      xref: 'paper',
      x: 0.99,
      y: 1,
      xanchor: 'right',
      yanchor: 'bottom',
      yshift: 1,
      text: 'n = nₘ (one full monolayer)',
      showarrow: false,
      font: hand(COLORS.ink),
    },
    {
      xref: 'x',
      yref: 'paper',
      x: (BET_RANGE[0] + BET_RANGE[1]) / 2,
      y: 1,
      yanchor: 'bottom',
      text: 'BET fit range',
      showarrow: false,
      font: { family: PLOT_FONT, size: 10, color: COLORS.bet },
    },
    ...(settling
      ? []
      : [
          {
            x,
            y: cov,
            xanchor: 'left' as const,
            yanchor: 'top' as const,
            xshift: 7,
            yshift: -3,
            text: 'sim.',
            showarrow: false,
            font: { family: PLOT_FONT, size: 10, color: COLORS.ink },
          },
        ]),
  ]

  const loadSym = mode === 'langmuir' ? 'θ' : 'n/nₘ'

  return (
    <article className="page">
      <header className="doc-head">
        <a className="back-link" href="#/">
          ← contents
        </a>
        <h1>Langmuir and BET adsorption isotherms</h1>
        <p className="doc-meta">Course: {COURSE} (CEP) · Topic: gas adsorption on solid surfaces</p>
        <p className="doc-summary">
          This page compares the Langmuir and BET isotherms for the same relative pressure, using a small particle
          simulation of the surface and the two equations plotted next to it.
        </p>
      </header>

      <Entry
        num="1"
        id="sim-title"
        title="Simulation and isotherm"
        note={
          <>
            T is constant. Pressure is given as P/P₀, where P₀ is the saturation vapour pressure at that T.
            <br />
            <br />
            K and c are on log scales.
          </>
        }
      >
        <figure className="figure" aria-label="Molecular view and isotherm">
          <dl className="readout" aria-live="off">
            <dt>model</dt>
            <dd>{mode === 'langmuir' ? 'Langmuir' : 'BET'}</dd>
            <dt>P/P₀</dt>
            <dd>{x.toFixed(2)}</dd>
            <dt>{loadSym}, equation</dt>
            <dd className={mode === 'langmuir' ? 'lang-ink' : 'bet-ink'}>{cov.toFixed(2)}</dd>
            <dt>{loadSym}, simulation avg.</dt>
            <dd>
              {stats.avgLoading.toFixed(2)}{' '}
              <span className={`sim-status${settling ? '' : ' settled'}`} role="status">
                {settling ? '(settling)' : '(settled)'}
              </span>
            </dd>
            <dt>surface</dt>
            <dd>
              {mode === 'langmuir'
                ? `${occupied}/${N_SITES} sites occupied, max. 1 layer`
                : `${total} molecules on ${N_SITES} sites, ${N_SITES - occupied} bare, tallest stack ${tallest}`}
            </dd>
          </dl>

          <div className="sim-grid">
            <div>
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
                    ? `Langmuir: ${occupied} of ${N_SITES} sites occupied, single layer, coverage ${stats.avgLoading.toFixed(2)}`
                    : `BET: ${total} molecules on ${N_SITES} sites, up to ${tallest} layers, n/nm ${stats.avgLoading.toFixed(2)}`
                }
              />
              <ul className="layer-legend" aria-label="Key">
                {LEGEND.map((l) => (
                  <li key={l.label}>
                    <span className="dot" style={{ background: l.color }} /> {l.label}
                  </li>
                ))}
                <li>
                  <span className="dash" /> one monolayer
                </li>
              </ul>
            </div>
            <div className="plot-area">
              <Plot
                data={isoData}
                layout={{
                  ...baseLayout(theme),
                  xaxis: { ...axis(theme), title: { ...axis(theme).title, text: 'P/P₀' }, range: [0, 1] },
                  yaxis: { ...axis(theme), title: { ...axis(theme).title, text: 'θ  or  n/nₘ' }, range: [0, Y_MAX] },
                  shapes: isoShapes,
                  annotations: isoAnnotations,
                }}
                config={{ staticPlot: true, responsive: true }}
                useResizeHandler
                className="plot"
              />
            </div>
          </div>

          <div className="controls">
            <div className="model-control">
              <span className="control-label">model</span>
              <div className="segmented" role="radiogroup" aria-label="Model">
                <button role="radio" aria-checked={mode === 'langmuir'} className={mode === 'langmuir' ? 'active lang' : ''} onClick={() => switchMode('langmuir')}>
                  Langmuir
                </button>
                <button role="radio" aria-checked={mode === 'bet'} className={mode === 'bet' ? 'active bet' : ''} onClick={() => switchMode('bet')}>
                  BET
                </button>
              </div>
            </div>
            <Slider
              id="x"
              symbol={<>P/P₀</>}
              name="relative pressure"
              unit="–"
              value={x.toFixed(2)}
              min={0}
              max={X_MAX}
              step={0.01}
              pos={x}
              onChange={setX}
              hint="gas pressure divided by the saturation pressure P₀"
            />
            {mode === 'langmuir' ? (
              <Slider
                id="K"
                symbol={<em>K</em>}
                name="Langmuir constant"
                unit="–"
                value={fmtConst(K)}
                min={0}
                max={LOG_STEPS}
                step={1}
                pos={toLogPos(K, K_RANGE)}
                onChange={(p) => setK(fromLogPos(p, K_RANGE))}
                hint="larger K: stronger binding, the monolayer fills at lower P/P₀"
              />
            ) : (
              <Slider
                id="c"
                symbol={<em>c</em>}
                name="BET constant"
                unit="–"
                value={fmtConst(c)}
                min={0}
                max={LOG_STEPS}
                step={1}
                pos={toLogPos(c, C_RANGE)}
                onChange={(p) => setC(fromLogPos(p, C_RANGE))}
                hint={c < 2 ? 'c < 2: weak first layer, no knee (type III)' : 'larger c: sharper knee (type II)'}
              />
            )}
            <div className="sim-buttons">
              <button type="button" className="button" aria-pressed={paused} onClick={() => setPaused((p) => !p)}>
                {paused ? 'Run' : 'Pause'}
              </button>
              <button type="button" className="button" onClick={reset}>
                Reset
              </button>
            </div>
          </div>
          <figcaption>
            <span className="figure-label">Fig. 1.</span> Left: cross-section of the surface, gas above, adsorbent
            below. Right: the isotherm for the current K and c. The filled dot is the current P/P₀. When the running
            average of the simulation has settled, a diamond is drawn on that point; changing any setting removes it
            again. The shaded band (P/P₀ = 0.05 to 0.35) is the range where the BET equation is usually fitted.
          </figcaption>
        </figure>
      </Entry>

      <Entry
        num="2"
        id="seeing-title"
        title="Reading the figure"
        note={<>Both curves use the same y-axis: θ for Langmuir, n/nₘ for BET. A value of 1 means one complete monolayer.</>}
      >
        <p>
          <strong className="lang-ink">Langmuir.</strong> Each site holds at most one molecule. As P/P₀ increases,
          more sites are occupied and the curve levels off at θ = 1, which is a full monolayer.
        </p>
        <p>
          <strong className="bet-ink">BET.</strong> Molecules can also adsorb on top of molecules that are already
          adsorbed. The first layer sits on the solid and is bound more strongly, so in the simulation it rarely
          desorbs. The upper layers behave like a liquid and exchange with the gas much more often. As P/P₀ approaches
          1 the stacks keep growing, and the loading diverges because the gas condenses on the surface.
        </p>
      </Entry>

      <Entry
        num="3"
        id="eq-title"
        title="Equations"
        note={
          <aside className="sticky" aria-label="Notes on the model assumptions">
            <p className="sticky-title">Notes: assumptions</p>
            <p>
              <span className="lang-ink">Langmuir</span>
            </p>
            <ul>
              <li>one molecule per site, monolayer only</li>
              <li>all sites identical</li>
              <li>no lateral interactions between adsorbed molecules</li>
            </ul>
            <p>
              <span className="bet-ink">BET</span>
            </p>
            <ul>
              <li>multilayer adsorption allowed</li>
              <li>Langmuir applied to each layer</li>
              <li>first layer binds to the solid; higher layers act like condensed liquid</li>
              <li>no lateral interactions</li>
            </ul>
          </aside>
        }
      >
        <div className={`eq-block lang${mode === 'langmuir' ? ' current' : ''}`}>
          <h3>
            3.1 Langmuir isotherm (monolayer)
            {mode === 'langmuir' && <span className="current-mark">current model</span>}
          </h3>
          <div className="formula key">
            <div className="formula-body eq-math">
              <Tex
                display
                tex={String.raw`\theta = \frac{K\,x}{1 + K\,x}`}
                fallback={
                  <>
                    <i>θ</i> = <Frac n={<><i>K</i>·<i>x</i></>} d={<>1 + <i>K</i>·<i>x</i></>} />
                  </>
                }
              />
              <Tex
                display
                tex={String.raw`\text{with}\quad x = \frac{P}{P_0}`}
                fallback={
                  <>
                    with <i>x</i> = <Frac n={<i>P</i>} d={<><i>P</i><sub>0</sub></>} />
                  </>
                }
              />
            </div>
            <span className="formula-number">(1)</span>
          </div>
          <dl className="terms">
            <Term sym={String.raw`\theta`} fallback={<i>θ</i>}>
              fractional surface coverage, the share of adsorption sites that are occupied (0 = empty, 1 = full
              monolayer)
            </Term>
            <Term sym="x = P/P_0" fallback={<><i>x</i> = <i>P</i>/<i>P</i><sub>0</sub></>}>
              relative pressure, gas pressure P divided by the saturation pressure P₀ (0 to 1)
            </Term>
            <Term sym="K" fallback={<i>K</i>}>
              Langmuir adsorption constant (equilibrium constant of adsorption ⇌ desorption), dimensionless here
              because it is written per unit of P/P₀. Larger K means stronger binding, so the surface fills at lower
              P/P₀.
            </Term>
          </dl>
        </div>

        <div className={`eq-block bet${mode === 'bet' ? ' current' : ''}`}>
          <h3>
            3.2 BET isotherm (multilayer)
            {mode === 'bet' && <span className="current-mark">current model</span>}
          </h3>
          <div className="formula key">
            <div className="formula-body eq-math">
              <Tex
                display
                tex={String.raw`\frac{n}{n_m} = \frac{c\,x}{(1 - x)\,(1 - x + c\,x)}`}
                fallback={
                  <>
                    <Frac n={<i>n</i>} d={<><i>n</i><sub>m</sub></>} /> ={' '}
                    <Frac n={<><i>c</i>·<i>x</i></>} d={<>(1 − <i>x</i>)(1 − <i>x</i> + <i>c</i>·<i>x</i>)</>} />
                  </>
                }
              />
              <Tex
                display
                tex={String.raw`\text{with}\quad x = \frac{P}{P_0}`}
                fallback={
                  <>
                    with <i>x</i> = <Frac n={<i>P</i>} d={<><i>P</i><sub>0</sub></>} />
                  </>
                }
              />
            </div>
            <span className="formula-number">(2)</span>
          </div>
          <dl className="terms">
            <Term sym="n" fallback={<i>n</i>}>
              amount of gas adsorbed at pressure P
            </Term>
            <Term sym="n_m" fallback={<><i>n</i><sub>m</sub></>}>
              monolayer capacity, the amount needed to cover the surface with one complete layer
            </Term>
            <Term sym="n/n_m" fallback={<><i>n</i>/<i>n</i><sub>m</sub></>}>
              number of monolayer equivalents adsorbed (can be larger than 1)
            </Term>
            <Term sym="P" fallback={<i>P</i>}>
              equilibrium pressure of the gas
            </Term>
            <Term sym="P_0" fallback={<><i>P</i><sub>0</sub></>}>
              saturation vapour pressure of the gas at the measurement temperature
            </Term>
            <Term sym="x = P/P_0" fallback={<><i>x</i> = <i>P</i>/<i>P</i><sub>0</sub></>}>
              relative pressure (0 to 1)
            </Term>
            <Term sym="c" fallback={<i>c</i>}>
              BET constant (often written C). It measures how much more strongly the first layer is bound than the
              higher layers:{' '}
              <Tex
                tex={String.raw`c \approx \exp\!\left(\frac{E_1 - E_L}{RT}\right)`}
                fallback={
                  <>
                    <i>c</i> ≈ exp((<i>E</i>
                    <sub>1</sub> − <i>E</i>
                    <sub>L</sub>)/<i>RT</i>)
                  </>
                }
              />
              , with <Tex tex="E_1" fallback={<><i>E</i><sub>1</sub></>} /> the heat of adsorption of the first
              layer and <Tex tex="E_L" fallback={<><i>E</i><sub>L</sub></>} /> the heat of liquefaction.
            </Term>
          </dl>
        </div>

        <p className="remark">
          <span className="label">Relation between the two.</span> Langmuir describes a single layer, so θ has a
          plateau at 1. BET applies the same idea to every layer, which is why n/nₘ rises steeply as P approaches P₀.
        </p>
      </Entry>

      <Entry
        num="4"
        id="why-title"
        title="Relevance for clean energy processes"
        note={<>Examples from the lecture. BET surface area is the value most often reported for porous electrodes and catalysts.</>}
      >
        <ul className="why-list">
          <li>
            <strong>Fuel cells.</strong> H<sub>2</sub> and O<sub>2</sub> adsorb on Pt catalyst sites before they
            react, so the coverage (Langmuir θ) sets the reaction rate. CO binds more strongly and blocks sites (CO
            poisoning).
          </li>
          <li>
            <strong>Catalysts and electrodes.</strong> The BET surface area is the standard way to characterise
            catalysts, fuel-cell catalyst layers and battery or supercapacitor electrodes. More surface means more
            active sites.
          </li>
          <li>
            <strong>Hydrogen storage.</strong> Porous materials (MOFs, activated carbon) store H<sub>2</sub> by
            physisorption through multilayer adsorption and pore filling, i.e. BET-type behaviour.
          </li>
          <li>
            <strong>CO<sub>2</sub> capture.</strong> Zeolites and MOFs adsorb CO<sub>2</sub> from flue gas or air.
            Their isotherm determines how much they take up and how easily they can be regenerated.
          </li>
        </ul>
      </Entry>
    </article>
  )
}
