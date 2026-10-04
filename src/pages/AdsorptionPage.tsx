import { useMemo, useState, type ReactNode } from 'react'
import type { Annotation, Data, Layout, Shape } from 'plotly.js'
import Plot from '../components/Plot'
import SurfaceView, { GAS_COLOR, LAYER_COLORS, N_SITES, SITE_ORDER } from '../components/SurfaceView'
import Tex, { Frac } from '../components/Tex'
import { betLoading, langmuirTheta, loading, siteStackHeights, type Model } from '../lib/adsorption'

const X_MAX = 0.95
const N_POINTS = 300

const COLORS = {
  langmuir: '#2a6fb0',
  bet: '#c4552b',
  ink: '#1d2433',
  muted: '#5b6475',
  grid: '#ebe8e0',
}

const BASE_LAYOUT: Partial<Layout> = {
  autosize: true,
  margin: { l: 56, r: 12, t: 12, b: 48 },
  font: { family: 'Source Sans 3, Helvetica, Arial, sans-serif', size: 13, color: COLORS.ink },
  paper_bgcolor: 'rgba(0,0,0,0)',
  plot_bgcolor: '#ffffff',
  hovermode: false,
  legend: { orientation: 'h', x: 0, y: 1.02, yanchor: 'bottom', bgcolor: 'rgba(0,0,0,0)' },
  dragmode: false,
}

const AXIS = { zeroline: false, gridcolor: COLORS.grid, linecolor: '#c9c4b6', showline: true, ticks: 'outside' as const }

// Log-scaled slider helpers: the slider runs over log10(value).
const toLog = (v: number) => Math.log10(v)
const fromLog = (s: number) => Math.pow(10, s)

/** Format with ~3 significant figures. */
const fmt = (v: number, sig = 3) => Number(v.toPrecision(sig)).toString()

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
  dim?: boolean
}

function Slider({ id, label, value, min, max, step, pos, onChange, hint, dim }: SliderProps) {
  return (
    <div className={`slider${dim ? ' dim' : ''}`}>
      <label htmlFor={id}>
        <span>{label}</span>
        <output htmlFor={id}>{value}</output>
      </label>
      <input id={id} type="range" min={min} max={max} step={step} value={pos} onChange={(e) => onChange(Number(e.target.value))} />
      {hint && <small>{hint}</small>}
    </div>
  )
}

interface Preset {
  id: string
  label: string
  K: number
  c: number
  x: number
  mode: Model
  explain: ReactNode
}

const PRESETS: Preset[] = [
  {
    id: 'strong',
    label: 'Strong adsorption (high c)',
    K: 200,
    c: 500,
    x: 0.2,
    mode: 'bet',
    explain: (
      <>
        The first layer binds far more strongly than the ones above it, so it fills almost completely before the
        second layer starts (Type II), as for N<sub>2</sub> on oxides and carbon blacks.
      </>
    ),
  },
  {
    id: 'weak',
    label: 'Weak adsorption (low c, Type III-like)',
    K: 0.5,
    c: 1,
    x: 0.6,
    mode: 'bet',
    explain: (
      <>
        With c ≈ 1 the solid holds the first layer no more tightly than the adsorbate holds itself, so stacks start
        growing while bare sites remain, as for water on a hydrophobic surface.
      </>
    ),
  },
  {
    id: 'langmuir',
    label: 'Langmuir-like (monolayer only)',
    K: 50,
    c: 50,
    x: 0.5,
    mode: 'langmuir',
    explain: (
      <>
        There is room for only one layer, as in narrow micropores (zeolites, activated carbon) or chemisorption, so
        uptake rises fast and plateaus at a full monolayer (Type I).
      </>
    ),
  },
]

const close = (a: number, b: number) => Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(b))

const LEGEND = [
  { color: LAYER_COLORS[0], label: 'layer 1 (on the solid)' },
  { color: LAYER_COLORS[1], label: 'layer 2' },
  { color: LAYER_COLORS[2], label: 'layer 3+' },
  { color: GAS_COLOR, label: 'gas molecule' },
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
  const [K, setK] = useState(30)
  const [c, setC] = useState(100)
  const [x, setX] = useState(0.3)
  const [mode, setMode] = useState<Model>('bet')

  const targets = useMemo(() => siteStackHeights(mode, x, K, c, SITE_ORDER), [mode, x, K, c])
  const total = targets.reduce((a, b) => a + b, 0)
  const occupied = targets.filter((h) => h > 0).length
  const tallest = Math.max(...targets)
  const cov = loading(mode, x, K, c)

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

  const yMax = mode === 'langmuir' ? 1.6 : Math.max(4, cov * 1.15)
  const curveStyle = (m: Model) =>
    mode === m ? { color: COLORS[m], width: 3 } : { color: COLORS[m], width: 1.5, dash: 'dot' as const }

  const isoData: Data[] = [
    {
      x: curves.xs,
      y: curves.lang,
      type: 'scatter',
      mode: 'lines',
      name: 'Langmuir θ',
      line: curveStyle('langmuir'),
      opacity: mode === 'langmuir' ? 1 : 0.45,
    },
    {
      x: curves.xs,
      y: curves.bet,
      type: 'scatter',
      mode: 'lines',
      name: 'BET n/nₘ',
      line: curveStyle('bet'),
      opacity: mode === 'bet' ? 1 : 0.45,
    },
    {
      x: [x],
      y: [cov],
      type: 'scatter',
      mode: 'markers',
      showlegend: false,
      marker: { size: 12, color: COLORS[mode], line: { color: '#fff', width: 2 } },
    },
  ]

  const isoShapes: Partial<Shape>[] = [
    { type: 'line', xref: 'paper', x0: 0, x1: 1, y0: 1, y1: 1, line: { color: COLORS.muted, width: 1.2, dash: 'dash' } },
  ]

  const isoAnnotations: Partial<Annotation>[] = [
    {
      xref: 'paper',
      x: 0.99,
      y: 1,
      xanchor: 'right',
      yanchor: 'bottom',
      yshift: 2,
      text: 'one full monolayer',
      showarrow: false,
      font: { size: 11, color: COLORS.muted },
    },
  ]

  const applyPreset = (p: Preset) => {
    setK(p.K)
    setC(p.c)
    setX(p.x)
    setMode(p.mode)
  }
  const isActive = (p: Preset) => close(K, p.K) && close(c, p.c) && close(x, p.x) && mode === p.mode

  return (
    <article className="page">
      <a className="back-link" href="#/">
        ← All tools
      </a>
      <h1>Langmuir vs BET Adsorption</h1>
      <p className="lede">
        Gas molecules adsorbing on a solid. Raise the pressure and watch the Langmuir surface fill up to a single
        layer, while in BET molecules keep stacking into multilayers.
      </p>

      {/* ---------- Hero: molecular view ---------- */}
      <section className="card hero" aria-label="Molecular view">
        <div className="hero-head">
          <div className="coverage">
            <span className="coverage-label">
              {mode === 'langmuir' ? (
                <>
                  Coverage <em>θ</em>
                </>
              ) : (
                <>
                  Loading <em>n</em>/<em>n</em>
                  <sub>m</sub>
                </>
              )}
            </span>
            <span className={`coverage-value ${mode}`}>{cov.toFixed(2)}</span>
            <span className="coverage-sub">
              {mode === 'langmuir'
                ? `${occupied} of ${N_SITES} sites occupied · 1 layer max`
                : `${total} molecules on ${N_SITES} sites · ${N_SITES - occupied} bare · up to ${tallest} layer${tallest === 1 ? '' : 's'}`}
            </span>
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

        <SurfaceView
          targets={targets}
          pressure={x}
          label={
            mode === 'langmuir'
              ? `Langmuir: ${occupied} of ${N_SITES} sites occupied, single layer, coverage ${cov.toFixed(2)}`
              : `BET: ${total} molecules on ${N_SITES} sites, up to ${tallest} layers, n/nm ${cov.toFixed(2)}`
          }
        />

        <div className="hero-controls">
          <div className="model-control">
            <span className="control-label">Model</span>
            <div className="segmented" role="radiogroup" aria-label="Model">
              <button role="radio" aria-checked={mode === 'langmuir'} className={mode === 'langmuir' ? 'active lang' : ''} onClick={() => setMode('langmuir')}>
                Langmuir
              </button>
              <button role="radio" aria-checked={mode === 'bet'} className={mode === 'bet' ? 'active bet' : ''} onClick={() => setMode('bet')}>
                BET
              </button>
            </div>
          </div>
          <Slider
            id="x"
            label={<>Pressure P/P₀</>}
            value={x.toFixed(2)}
            min={0}
            max={X_MAX}
            step={0.01}
            pos={x}
            onChange={setX}
            hint="relative to the saturation pressure P₀"
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
            hint="binding strength (per unit P/P₀)"
            dim={mode !== 'langmuir'}
          />
          <Slider
            id="c"
            label={<>BET constant c</>}
            value={fmt(c)}
            min={0}
            max={3}
            step={0.01}
            pos={toLog(c)}
            onChange={(s) => setC(fromLog(s))}
            hint="c ≈ exp[(E₁ − E_L)/RT]"
            dim={mode !== 'bet'}
          />
        </div>

        <div className="presets" role="group" aria-label="Typical cases">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`preset${isActive(p) ? ' active' : ''}`}
              aria-pressed={isActive(p)}
              onClick={() => applyPreset(p)}
            >
              <span className="preset-label">{p.label}</span>
              <span className="preset-explain">{p.explain}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ---------- Secondary: isotherm ---------- */}
      <section className="card iso-grid">
        <div className="iso-plot">
          <h2>Isotherm</h2>
          <Plot
            data={isoData}
            layout={{
              ...BASE_LAYOUT,
              xaxis: { ...AXIS, title: { text: 'Relative pressure P/P₀' }, range: [0, 1] },
              yaxis: { ...AXIS, title: { text: 'θ  or  n/nₘ' }, range: [0, yMax] },
              shapes: isoShapes,
              annotations: isoAnnotations,
            }}
            config={{ staticPlot: true, responsive: true }}
            useResizeHandler
            className="plot"
          />
          <p className="caption">The dot is the current pressure shown in the molecular view above.</p>
        </div>
        <div className="iso-text">
          <h2>What you are seeing</h2>
          <p>
            <strong className="lang-ink">Langmuir:</strong> each site holds at most one molecule. As P rises the
            surface fills up, and the curve levels off at θ = 1, a full monolayer.
          </p>
          <p>
            <strong className="bet-ink">BET:</strong> molecules can also land on top of adsorbed ones. The first
            layer sits on the solid and is bound more strongly (in the animation it rarely leaves), while upper layers
            behave like a liquid and exchange with the gas often. As P/P₀ → 1 the stacks keep growing: the gas
            condenses on the surface.
          </p>
        </div>
      </section>

      {/* ---------- The equations ---------- */}
      <section className="equations" aria-labelledby="eq-title">
        <h2 id="eq-title" className="section-title">
          The equations
        </h2>
        <div className="eq-grid">
          <div className={`card eq-card lang${mode === 'langmuir' ? ' current' : ''}`}>
            <div className="eq-head">
              <h3>Langmuir isotherm (monolayer)</h3>
              {mode === 'langmuir' && <span className="eq-badge">current model</span>}
            </div>
            <div className="eq-math">
              <Tex
                display
                tex={String.raw`\theta = \frac{K\,P}{1 + K\,P}`}
                fallback={
                  <>
                    <i>θ</i> = <Frac n={<><i>K</i>·<i>P</i></>} d={<>1 + <i>K</i>·<i>P</i></>} />
                  </>
                }
              />
            </div>
            <dl className="terms">
              <Term sym={String.raw`\theta`} fallback={<i>θ</i>}>
                fractional surface coverage: share of adsorption sites that are occupied (0 = empty, 1 = full
                monolayer)
              </Term>
              <Term sym="P" fallback={<i>P</i>}>
                partial pressure of the gas above the surface
              </Term>
              <Term sym="K" fallback={<i>K</i>}>
                Langmuir adsorption constant (equilibrium constant of adsorption ⇌ desorption); larger K = stronger
                binding, surface fills at lower pressure
              </Term>
            </dl>
            <h4>Assumptions</h4>
            <ul className="assumptions">
              <li>one molecule per site</li>
              <li>only a single layer</li>
              <li>all sites equivalent</li>
              <li>no interaction between adsorbed molecules</li>
            </ul>
          </div>

          <div className={`card eq-card bet${mode === 'bet' ? ' current' : ''}`}>
            <div className="eq-head">
              <h3>BET isotherm (multilayer)</h3>
              {mode === 'bet' && <span className="eq-badge">current model</span>}
            </div>
            <div className="eq-math">
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
            <dl className="terms">
              <Term sym="n" fallback={<i>n</i>}>
                amount of gas adsorbed at pressure P
              </Term>
              <Term sym="n_m" fallback={<><i>n</i><sub>m</sub></>}>
                amount needed to form one complete monolayer
              </Term>
              <Term sym="n/n_m" fallback={<><i>n</i>/<i>n</i><sub>m</sub></>}>
                number of “layers’ worth” adsorbed (can exceed 1)
              </Term>
              <Term sym="P" fallback={<i>P</i>}>
                equilibrium pressure of the gas
              </Term>
              <Term sym="P_0" fallback={<><i>P</i><sub>0</sub></>}>
                saturation vapour pressure of the gas at that temperature
              </Term>
              <Term sym="x = P/P_0" fallback={<><i>x</i> = <i>P</i>/<i>P</i><sub>0</sub></>}>
                relative pressure (0 to 1)
              </Term>
              <Term sym="c" fallback={<i>c</i>}>
                BET constant, related to how much more strongly the first layer binds than the higher layers:{' '}
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
                , where <Tex tex="E_1" fallback={<><i>E</i><sub>1</sub></>} /> = adsorption heat of the first layer
                and <Tex tex="E_L" fallback={<><i>E</i><sub>L</sub></>} /> = heat of liquefaction
              </Term>
            </dl>
            <h4>Assumptions</h4>
            <ul className="assumptions">
              <li>multiple layers allowed</li>
              <li>first layer binds directly to the solid</li>
              <li>higher layers behave like liquid condensation</li>
              <li>no lateral interactions</li>
            </ul>
          </div>
        </div>
        <p className="eq-relation">
          <strong>How they relate:</strong> Langmuir describes a single layer and plateaus; BET extends the idea to
          multiple layers, which is why its curve rises sharply as P → P₀.
        </p>
      </section>

      <section className="card">
        <h2>Why it matters for clean energy</h2>
        <p>
          Reactions, charge storage and gas uptake all happen at surfaces, so the BET surface area is one of the
          first numbers measured for a new energy material.
        </p>
        <ul className="why-list">
          <li>
            <strong>Catalyst supports and fuel cell catalyst layers.</strong> Pt nanoparticles in PEM fuel cells sit
            on high-area carbon (roughly 250–800 m²/g). More support area spreads the Pt more thinly, so more of the
            expensive metal touches the reactants, and the porosity of the layer controls how gas and water move
            through it.
          </li>
          <li>
            <strong>Porous electrodes.</strong> A supercapacitor stores charge in the electric double layer, so its
            capacitance scales with accessible area; activated carbons reach 1000–2000 m²/g. In batteries, extra
            area speeds up charging but also feeds side reactions with the electrolyte.
          </li>
          <li>
            <strong>Gas storage materials.</strong> Metal–organic frameworks and porous carbons store H<sub>2</sub>{' '}
            and CH<sub>4</sub> by adsorption, and uptake grows with surface area (several thousand m²/g for the best
            MOFs). In such micropores BET gives an <em>apparent</em> area, since the multilayer picture no longer
            holds exactly.
          </li>
        </ul>
      </section>
    </article>
  )
}
