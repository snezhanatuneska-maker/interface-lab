import { useMemo, useState, type ReactNode } from 'react'
import type { Annotation, Data, Layout, Shape } from 'plotly.js'
import Plot from '../components/Plot'
import SurfaceView, { type SurfaceMode } from '../components/SurfaceView'
import {
  betLineFromParams,
  betLoading,
  betParamsFromLine,
  betTransform,
  gaussian,
  langmuirTheta,
  linearFit,
  mulberry32,
  SIGMA_N2_NM2,
  specificSurfaceArea,
} from '../lib/adsorption'

const X_MAX = 0.95
const N_POINTS = 300
const BET_RANGE: [number, number] = [0.05, 0.35]
const LIN_X_MAX = 0.5
const NOISE = 0.02 // 2 % relative noise on synthetic V "measurements"

const COLORS = {
  langmuir: '#2a6fb0',
  bet: '#c4552b',
  ink: '#1d2433',
  muted: '#5b6475',
  grid: '#ebe8e0',
  shade: 'rgba(242, 193, 78, 0.22)',
}

const BASE_LAYOUT: Partial<Layout> = {
  autosize: true,
  margin: { l: 64, r: 16, t: 16, b: 56 },
  font: { family: 'Source Sans 3, Helvetica, Arial, sans-serif', size: 14, color: COLORS.ink },
  paper_bgcolor: 'rgba(0,0,0,0)',
  plot_bgcolor: '#ffffff',
  hovermode: 'x unified',
  legend: { orientation: 'h', x: 0, y: 1.02, yanchor: 'bottom', bgcolor: 'rgba(0,0,0,0)' },
  dragmode: false,
}

const AXIS = { zeroline: false, gridcolor: COLORS.grid, linecolor: '#c9c4b6', showline: true, ticks: 'outside' as const }

// Log-scaled slider helpers: the slider runs over log10(value).
const toLog = (v: number) => Math.log10(v)
const fromLog = (s: number) => Math.pow(10, s)

/** Format with ~3 significant figures, using exponent notation for very small/large values. */
function fmt(v: number, sig = 3): string {
  if (!Number.isFinite(v)) return '—'
  const a = Math.abs(v)
  if (a !== 0 && (a < 1e-3 || a >= 1e5)) return v.toExponential(sig - 1).replace('e', ' × 10^')
  return Number(v.toPrecision(sig)).toString()
}

function Sci({ v, sig = 3 }: { v: number; sig?: number }) {
  const s = fmt(v, sig)
  const [m, e] = s.split(' × 10^')
  return e === undefined ? <>{s}</> : <>{m} × 10<sup>{Number(e)}</sup></>
}

interface SliderProps {
  id: string
  label: ReactNode
  value: string
  min: number
  max: number
  step: number
  pos: number
  onChange: (v: number) => void
  hint?: string
}

function Slider({ id, label, value, min, max, step, pos, onChange, hint }: SliderProps) {
  return (
    <div className="slider">
      <label htmlFor={id}>
        <span>{label}</span>
        <output htmlFor={id}>{value}</output>
      </label>
      <input id={id} type="range" min={min} max={max} step={step} value={pos} onChange={(e) => onChange(Number(e.target.value))} />
      {hint && <small>{hint}</small>}
    </div>
  )
}

type Tab = 'isotherms' | 'linear'

export default function AdsorptionPage() {
  const [Vm, setVm] = useState(50)
  const [K, setK] = useState(30)
  const [C, setC] = useState(100)
  const [x, setX] = useState(0.3)
  const [mode, setMode] = useState<SurfaceMode>('bet')
  const [tab, setTab] = useState<Tab>('isotherms')
  const [noisy, setNoisy] = useState(true)
  const [seed, setSeed] = useState(7)

  // ---------- Isotherms ----------
  const curves = useMemo(() => {
    const xs: number[] = []
    const lang: number[] = []
    const bet: number[] = []
    for (let i = 0; i <= N_POINTS; i++) {
      const xi = (i / N_POINTS) * X_MAX
      xs.push(xi)
      lang.push(Vm * langmuirTheta(xi, K))
      bet.push(Vm * betLoading(xi, C))
    }
    return { xs, lang, bet }
  }, [Vm, K, C])

  const yMax = 5 * Vm
  const vLangX = Vm * langmuirTheta(x, K)
  const vBetX = Vm * betLoading(x, C)

  const isoData: Data[] = [
    {
      x: curves.xs,
      y: curves.lang,
      type: 'scatter',
      mode: 'lines',
      name: 'Langmuir (monolayer)',
      line: { color: COLORS.langmuir, width: 2.5 },
      hovertemplate: '%{y:.1f} cm³/g<extra>Langmuir</extra>',
    },
    {
      x: curves.xs,
      y: curves.bet,
      type: 'scatter',
      mode: 'lines',
      name: 'BET (multilayer)',
      line: { color: COLORS.bet, width: 2.5 },
      hovertemplate: '%{y:.1f} cm³/g<extra>BET</extra>',
    },
    {
      x: [x, x],
      y: [vLangX, Math.min(vBetX, yMax)],
      type: 'scatter',
      mode: 'markers',
      showlegend: false,
      hoverinfo: 'skip',
      marker: { size: 10, color: [COLORS.langmuir, COLORS.bet], line: { color: '#fff', width: 2 } },
    },
  ]

  const isoShapes: Partial<Shape>[] = [
    {
      type: 'line',
      xref: 'paper',
      x0: 0,
      x1: 1,
      y0: Vm,
      y1: Vm,
      line: { color: COLORS.muted, width: 1.5, dash: 'dash' },
    },
    {
      type: 'line',
      x0: x,
      x1: x,
      yref: 'paper',
      y0: 0,
      y1: 1,
      line: { color: '#9aa1ae', width: 1, dash: 'dot' },
    },
  ]

  const isoAnnotations: Partial<Annotation>[] = [
    {
      xref: 'paper',
      x: 0.99,
      y: Vm,
      xanchor: 'right',
      yshift: 2,
      bgcolor: 'rgba(255,255,255,0.85)',
      yanchor: 'bottom',
      text: `monolayer capacity V<sub>m</sub> = ${fmt(Vm)}`,
      showarrow: false,
      font: { size: 12, color: COLORS.muted },
    },
  ]

  // ---------- Linearized BET ----------
  const lin = useMemo(() => {
    const rand = mulberry32(seed)
    const xs: number[] = []
    const ys: number[] = []
    for (let xi = BET_RANGE[0]; xi <= BET_RANGE[1] + 1e-9; xi += 0.025) {
      const vTrue = Vm * betLoading(xi, C)
      const v = noisy ? vTrue * (1 + NOISE * gaussian(rand)) : vTrue
      xs.push(xi)
      ys.push(betTransform(xi, v))
    }
    const fit = linearFit(xs, ys)
    const recovered = betParamsFromLine(fit.slope, fit.intercept)
    return { xs, ys, fit, recovered, exact: betLineFromParams(Vm, C) }
  }, [Vm, C, noisy, seed])

  const linData: Data[] = [
    {
      x: [0, LIN_X_MAX],
      y: [lin.fit.intercept, lin.fit.intercept + lin.fit.slope * LIN_X_MAX],
      type: 'scatter',
      mode: 'lines',
      name: 'Least-squares fit',
      line: { color: COLORS.ink, width: 2 },
      hoverinfo: 'skip',
    },
    {
      x: lin.xs,
      y: lin.ys,
      type: 'scatter',
      mode: 'markers',
      name: noisy ? 'Synthetic data (±2 % noise)' : 'Synthetic data (exact BET)',
      marker: { color: COLORS.bet, size: 9, line: { color: '#fff', width: 1.5 } },
      hovertemplate: 'x = %{x:.3f}<br>x/[V(1−x)] = %{y:.3e} g/cm³<extra></extra>',
    },
  ]

  const linShapes: Partial<Shape>[] = [
    {
      type: 'rect',
      yref: 'paper',
      x0: BET_RANGE[0],
      x1: BET_RANGE[1],
      y0: 0,
      y1: 1,
      fillcolor: COLORS.shade,
      line: { width: 0 },
      layer: 'below',
    },
  ]

  const linAnnotations: Partial<Annotation>[] = [
    {
      x: (BET_RANGE[0] + BET_RANGE[1]) / 2,
      yref: 'paper',
      y: 0.98,
      yanchor: 'top',
      text: 'valid BET range 0.05–0.35',
      showarrow: false,
      font: { size: 12, color: COLORS.muted },
    },
  ]

  const S = specificSurfaceArea(Vm)
  const Srec = specificSurfaceArea(lin.recovered.Vm)
  const unphysicalC = !(lin.recovered.C > 0) || lin.fit.intercept <= 0

  return (
    <article className="page">
      <h1>Langmuir vs BET Adsorption</h1>
      <p className="lede">
        Gas molecules adsorbing on a solid. Move the sliders and watch why the Langmuir isotherm levels off at
        one monolayer, while the BET isotherm keeps climbing as molecules stack into multilayers.
      </p>

      <section className="card">
        <div className="param-grid">
          <Slider
            id="vm"
            label={<>Monolayer capacity V<sub>m</sub></>}
            value={`${Vm} cm³(STP)/g`}
            min={5}
            max={300}
            step={1}
            pos={Vm}
            onChange={setVm}
          />
          <Slider
            id="k"
            label={<>Langmuir constant K</>}
            value={fmt(K)}
            min={toLog(0.3)}
            max={toLog(1000)}
            step={0.01}
            pos={toLog(K)}
            onChange={(s) => setK(fromLog(s))}
            hint="adsorption strength (per unit P/P₀)"
          />
          <Slider
            id="c"
            label={<>BET constant C</>}
            value={fmt(C)}
            min={0}
            max={3}
            step={0.01}
            pos={toLog(C)}
            onChange={(s) => setC(fromLog(s))}
            hint="C ≈ exp[(E₁ − E_L)/RT]"
          />
        </div>

        <div className="sim-grid">
          <div className="sim-plot">
            <div className="tabs" role="tablist" aria-label="Plot view">
              <button role="tab" aria-selected={tab === 'isotherms'} className={tab === 'isotherms' ? 'active' : ''} onClick={() => setTab('isotherms')}>
                Isotherms
              </button>
              <button role="tab" aria-selected={tab === 'linear'} className={tab === 'linear' ? 'active' : ''} onClick={() => setTab('linear')}>
                Linearized BET
              </button>
            </div>

            {tab === 'isotherms' ? (
              <>
                <Plot
                  data={isoData}
                  layout={{
                    ...BASE_LAYOUT,
                    xaxis: { ...AXIS, title: { text: 'Relative pressure P/P₀' }, range: [0, 1] },
                    yaxis: { ...AXIS, title: { text: 'V  [cm³(STP)/g]' }, range: [0, yMax] },
                    shapes: isoShapes,
                    annotations: isoAnnotations,
                  }}
                  config={{ displaylogo: false, responsive: true, displayModeBar: false }}
                  useResizeHandler
                  className="plot"
                />
                <p className="caption">
                  Langmuir saturates at V<sub>m</sub>. BET passes V<sub>m</sub> and diverges as P/P₀ → 1 (bulk
                  condensation); the curve leaves the plot near saturation. Dotted line = P/P₀ shown on the right.
                </p>
              </>
            ) : (
              <>
                <Plot
                  data={linData}
                  layout={{
                    ...BASE_LAYOUT,
                    hovermode: 'closest',
                    margin: { ...BASE_LAYOUT.margin, l: 76 },
                    xaxis: { ...AXIS, title: { text: 'x = P/P₀' }, range: [0, LIN_X_MAX] },
                    yaxis: { ...AXIS, title: { text: 'x / [V(1 − x)]  [g/cm³]' }, rangemode: 'tozero', exponentformat: 'power' },
                    shapes: linShapes,
                    annotations: linAnnotations,
                  }}
                  config={{ displaylogo: false, responsive: true, displayModeBar: false }}
                  useResizeHandler
                  className="plot"
                />
                <div className="lin-controls">
                  <label>
                    <input type="checkbox" checked={noisy} onChange={(e) => setNoisy(e.target.checked)} /> add ±2 %
                    measurement noise
                  </label>
                  {noisy && (
                    <button type="button" className="btn-small" onClick={() => setSeed((s) => s + 1)}>
                      New sample
                    </button>
                  )}
                </div>

                <table className="readout">
                  <tbody>
                    <tr>
                      <th>Slope s = (C − 1)/(V<sub>m</sub>C)</th>
                      <td>
                        <Sci v={lin.fit.slope} /> g/cm³
                      </td>
                    </tr>
                    <tr>
                      <th>Intercept i = 1/(V<sub>m</sub>C)</th>
                      <td>
                        <Sci v={lin.fit.intercept} /> g/cm³
                      </td>
                    </tr>
                    <tr>
                      <th>R²</th>
                      <td>{lin.fit.r2.toFixed(5)}</td>
                    </tr>
                    <tr className="sep">
                      <th>
                        V<sub>m</sub> = 1/(s + i)
                      </th>
                      <td>
                        <strong>{fmt(lin.recovered.Vm)}</strong> cm³/g <span className="muted">(set: {Vm})</span>
                      </td>
                    </tr>
                    <tr>
                      <th>C = 1 + s/i</th>
                      <td>
                        <strong>{unphysicalC ? 'not physical' : fmt(lin.recovered.C)}</strong>{' '}
                        <span className="muted">(set: {fmt(C)})</span>
                      </td>
                    </tr>
                    <tr>
                      <th>S<sub>BET</sub> from fitted V<sub>m</sub></th>
                      <td>
                        <strong>{fmt(Srec)}</strong> m²/g
                      </td>
                    </tr>
                  </tbody>
                </table>
                {unphysicalC && (
                  <p className="note">
                    The fitted intercept is ≤ 0, so C comes out negative. At large C the intercept is tiny and
                    measurement noise swamps it, but V<sub>m</sub> = 1/(s + i) is still robust. This also happens
                    with real data; it is a reason to check the fitting range.
                  </p>
                )}
                <p className="caption">
                  Fit uses only points in the shaded range. Synthetic data follow the BET equation exactly, so they
                  stay linear everywhere; real isotherms bend away outside ≈ 0.05–0.35.
                </p>
              </>
            )}
          </div>

          <div className="sim-surface">
            <h2>Surface view</h2>
            <div className="segmented" role="radiogroup" aria-label="Model">
              <button role="radio" aria-checked={mode === 'langmuir'} className={mode === 'langmuir' ? 'active lang' : ''} onClick={() => setMode('langmuir')}>
                Langmuir
              </button>
              <button role="radio" aria-checked={mode === 'bet'} className={mode === 'bet' ? 'active bet' : ''} onClick={() => setMode('bet')}>
                BET
              </button>
            </div>
            <Slider
              id="x"
              label={<>Relative pressure P/P₀</>}
              value={x.toFixed(2)}
              min={0}
              max={X_MAX}
              step={0.01}
              pos={x}
              onChange={setX}
            />
            <SurfaceView mode={mode} x={x} K={K} C={C} />
            <p className="legend-note">
              {mode === 'bet' ? (
                <>
                  <span className="dot" style={{ background: '#c4552b' }} /> 1st layer (bound to the solid){' '}
                  <span className="dot" style={{ background: '#e9a98d' }} /> upper layers (like liquid)
                </>
              ) : (
                <>
                  <span className="dot" style={{ background: '#2a6fb0' }} /> adsorbed molecule, one per site
                </>
              )}
            </p>
          </div>
        </div>
      </section>

      <div className="info-grid">
        <section className="card key-idea">
          <h2>Key idea</h2>
          <p>
            <strong className="lang-ink">Langmuir:</strong> one molecule per site, all sites equivalent, no
            interaction between adsorbed molecules. Once every site is taken the surface is full, so adsorption
            stops at a <em>monolayer</em> (V → V<sub>m</sub>).
          </p>
          <p>
            <strong className="bet-ink">BET:</strong> molecules can adsorb on top of already adsorbed ones, forming{' '}
            <em>multilayers</em>. Only the first layer feels the solid; layers above it behave like condensation
            into a liquid, so V grows without limit as P/P₀ → 1. Fitting BET at low P/P₀ gives V<sub>m</sub>, which
            is the standard way to measure the <em>specific surface area</em> of powders and porous materials.
          </p>
        </section>

        <section className="card">
          <h2>Specific surface area</h2>
          <p className="formula">
            S = V<sub>m</sub> · N<sub>A</sub> · σ / 22 414
          </p>
          <p className="ssa">
            <strong>{fmt(S, 4)}</strong> m²/g
          </p>
          <p className="small muted">
            V<sub>m</sub> = {Vm} cm³(STP)/g, N<sub>A</sub> = 6.022 × 10<sup>23</sup> mol⁻¹, σ(N<sub>2</sub>) ={' '}
            {SIGMA_N2_NM2} nm² = {SIGMA_N2_NM2} × 10<sup>−18</sup> m², 22 414 cm³/mol = molar volume at STP. Each
            cm³(STP)/g of monolayer ≈ 4.35 m²/g.
          </p>
        </section>
      </div>
    </article>
  )
}
