import type { Data } from 'plotly.js'
import Plot from '../../components/Plot'
import PoreNetworkSim, { NetworkView } from '../../components/PoreNetworkSim'
import RichText from '../../components/training/RichText'
import Tex from '../../components/Tex'
import type { ExerciseDef } from '../../components/training/ExerciseTrainer'
import { axis, baseLayout, staticConfig } from '../../lib/plotTheme'
import { useThemeColors } from '../../lib/themeColors'
import {
  EX11, EX12, EX13, EX14, F_ETHANOL, network13, parts11, parts12, parts13, parts14,
  randomize11, randomize12, randomize13, randomize14, text11,
  type Ex11, type Ex12, type Ex13, type Ex14,
} from '../../lib/sheet1'
import { fmt } from '../../lib/training'

// Liquid Interfaces – Exercise Sheet 1: task text, figures (redrawn as SVG) and interactive extras for each exercise.
// The physics, solution paths and official answers live in src/lib/sheet1.ts.

// ---------- 1.1 ----------

function BalanceFigure({ p }: { p: Ex11 }) {
  return (
    <svg viewBox="0 0 440 250" className="tensio-svg" role="img" aria-label="A balance arm on a pivot: a counterweight pan on the left, the Wilhelmy plate hanging on the right above a trough of soap solution that is raised towards it.">
      <path d="M220 60 L210 85 H230 Z" className="tensio-metal" />
      <line x1="80" y1="60" x2="360" y2="60" className="tensio-wire" strokeWidth={4} />
      <line x1="100" y1="60" x2="100" y2="120" className="tensio-wire" />
      <path d="M65 120 H135 L125 132 H75 Z" className="tensio-metal" />
      <rect x="90" y="104" width="20" height="16" className="ex-weight" />
      <text x="100" y="150" textAnchor="middle" className="tensio-note">counterweight pan (+{fmt(p.mass * 1e3)} g)</text>
      <line x1="340" y1="60" x2="340" y2="110" className="tensio-wire" />
      <rect x="318" y="110" width="44" height="60" className="tensio-metal" />
      <text x="372" y="140" className="tensio-note">plate</text>
      <rect x="270" y="178" width="140" height="44" className="tensio-liquid" />
      <path d="M270 176 V224 H410 V176" className="tensio-wire" />
      <text x="340" y="242" textAnchor="middle" className="tensio-note">trough with soap solution</text>
      <path d="M255 236 V196" className="tensio-arrow" markerEnd="url(#ex-up)" />
      <path d="M425 236 V196" className="tensio-arrow" markerEnd="url(#ex-up)" />
      <defs>
        <marker id="ex-up" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0 0 L10 5 L0 10 Z" className="tensio-arrowhead" />
        </marker>
      </defs>
    </svg>
  )
}

const def11: ExerciseDef<Ex11> = {
  original: EX11,
  randomize: randomize11,
  task: (p) => (
    <p>
      <RichText text={text11(p)} />
    </p>
  ),
  figure: (p) => (
    <figure className="figure tensio-figure">
      <BalanceFigure p={p} />
      <figcaption>
        <span className="figure-label">Figure.</span> Wilhelmy balance: the arm is kept horizontal by adding mass to
        the counterweight pan once the plate touches the liquid.
      </figcaption>
    </figure>
  ),
  parts: parts11,
}

// ---------- 1.2 ----------

function SurfaceGroups() {
  const si = (x: number, y: number, label = 'Si') => (
    <text x={x} y={y} textAnchor="middle" className="ex-chem">
      {label}
    </text>
  )
  return (
    <svg viewBox="0 0 440 210" className="tensio-svg" role="img" aria-label="Bare glass carries isolated, vicinal and geminal silanol groups (Si–OH) and siloxane bridges; silanized glass carries Si–CH₃ groups.">
      <text x="110" y="16" textAnchor="middle" className="tensio-title">bare glass</text>
      <text x="330" y="16" textAnchor="middle" className="tensio-title">silanized glass</text>
      <rect x="10" y="150" width="200" height="40" className="tensio-metal" />
      <rect x="230" y="150" width="200" height="40" className="tensio-metal" />
      {/* bare: isolated, siloxane, vicinal, geminal */}
      {si(30, 140)}
      <text x="30" y="110" textAnchor="middle" className="ex-chem">OH</text>
      <line x1="30" y1="114" x2="30" y2="128" className="tensio-wire" />
      <text x="30" y="204" textAnchor="middle" className="tensio-note">isolated</text>
      {si(70, 140)}
      {si(100, 140)}
      <path d="M74 128 Q85 112 96 128" className="tensio-wire" />
      <text x="85" y="114" textAnchor="middle" className="ex-chem">O</text>
      <text x="85" y="204" textAnchor="middle" className="tensio-note">siloxane</text>
      {si(135, 140)}
      {si(160, 140)}
      <text x="135" y="110" textAnchor="middle" className="ex-chem">OH</text>
      <text x="160" y="110" textAnchor="middle" className="ex-chem">OH</text>
      <line x1="135" y1="114" x2="135" y2="128" className="tensio-wire" />
      <line x1="160" y1="114" x2="160" y2="128" className="tensio-wire" />
      <text x="147" y="204" textAnchor="middle" className="tensio-note">vicinal</text>
      {si(192, 140)}
      <text x="180" y="100" textAnchor="middle" className="ex-chem">OH</text>
      <text x="204" y="100" textAnchor="middle" className="ex-chem">OH</text>
      <line x1="188" y1="128" x2="182" y2="104" className="tensio-wire" />
      <line x1="196" y1="128" x2="202" y2="104" className="tensio-wire" />
      <text x="192" y="204" textAnchor="middle" className="tensio-note">geminal</text>
      {/* silanized */}
      {[260, 300, 340, 380, 415].map((x) => (
        <g key={x}>
          {si(x, 140)}
          <line x1={x} y1={114} x2={x} y2={128} className="tensio-wire" />
          <text x={x} y={110} textAnchor="middle" className="ex-chem">
            CH₃
          </text>
        </g>
      ))}
      <text x="330" y="204" textAnchor="middle" className="tensio-note">Si–CH₃ (dimethyldichlorosilane)</text>
    </svg>
  )
}

function AnglePlot({ p }: { p: Ex12 }) {
  const theme = useThemeColors()
  const err = { type: 'constant' as const, value: 3, color: theme.muted, thickness: 1, width: 3 }
  const data: Data[] = [
    { x: F_ETHANOL, y: p.bare, error_y: err, type: 'scatter', mode: 'markers', name: 'bare glass', marker: { size: 10, color: theme.plotBg, line: { color: theme.data1, width: 2 } } },
    { x: F_ETHANOL, y: p.sil, error_y: err, type: 'scatter', mode: 'markers', name: 'silanized glass', marker: { size: 10, color: theme.data2 } },
  ]
  return (
    <div role="img" aria-label={`Contact angle against ethanol fraction. Bare: ${p.bare.join(', ')}°. Silanized: ${p.sil.join(', ')}°.`}>
      <Plot
        data={data}
        layout={{
          ...baseLayout(theme),
          showlegend: true,
          xaxis: { ...axis(theme), title: { text: 'f<sub>ethanol</sub>' }, range: [-0.05, 1.05] },
          yaxis: { ...axis(theme), title: { text: 'δ (°)' }, range: [0, 110] },
        }}
        config={staticConfig}
        useResizeHandler
        className="plot"
      />
    </div>
  )
}

function GammaSLPlot({ inputs }: { inputs: string[] }) {
  const theme = useThemeColors()
  const n = F_ETHANOL.length
  const val = (s: string) => {
    const v = Number(s.replace(',', '.'))
    return s.trim() === '' || !Number.isFinite(v) ? null : v
  }
  const bare = inputs.slice(0, n).map(val)
  const sil = inputs.slice(n, 2 * n).map(val)
  if (![...bare, ...sil].some((v) => v !== null)) return <p className="note">Enter values in the table to plot your γ<sub>sl</sub> against f<sub>ethanol</sub>.</p>
  const data: Data[] = [
    { x: F_ETHANOL, y: bare, type: 'scatter', mode: 'lines+markers', name: 'bare (yours)', connectgaps: true, line: { color: theme.data1 }, marker: { size: 8 } },
    { x: F_ETHANOL, y: sil, type: 'scatter', mode: 'lines+markers', name: 'silanized (yours)', connectgaps: true, line: { color: theme.data2 }, marker: { size: 8 } },
  ]
  return (
    <div role="img" aria-label="Your γ_sl values plotted against the ethanol fraction.">
      <Plot
        data={data}
        layout={{
          ...baseLayout(theme),
          showlegend: true,
          xaxis: { ...axis(theme), title: { text: 'f<sub>ethanol</sub>' }, range: [-0.05, 1.05] },
          yaxis: { ...axis(theme), title: { text: 'γ<sub>sl</sub> (mN/m)' }, rangemode: 'tozero' },
        }}
        config={staticConfig}
        useResizeHandler
        className="plot"
      />
    </div>
  )
}

const def12: ExerciseDef<Ex12> = {
  original: EX12,
  randomize: randomize12,
  task: (p) => (
    <>
      <p>
        In a research study, the contact angles of ethanol–water mixtures (ethanol fraction f<sub>ethanol</sub>) are
        measured on glass substrates that are either untreated or silanized with dimethyldichlorosilane. The diagrams
        show the chemical composition of each surface and the contact-angle measurements.
      </p>
      <ul className="ex-data">
        <li>
          γ<sub>sg,bare</sub> = {p.gSGBare} mN/m; γ<sub>sg,silanized</sub> = {p.gSGSil} mN/m
        </li>
        <li>
          liquid–gas surface tension of the mixture (mN/m):
          <div className="formula-body">
            <Tex display tex={String.raw`\gamma_{lg} = 17.6 + 28.3\,e^{-f_\text{ethanol}/0.084} + 24.8\,e^{-f_\text{ethanol}/0.566}`} />
          </div>
        </li>
      </ul>
      <div className="table-wrap">
        <table className="data-table ex-table">
          <caption className="note">Contact angles δ (°) read from the figure</caption>
          <thead>
            <tr>
              <th scope="col">f<sub>ethanol</sub></th>
              {F_ETHANOL.map((f) => (
                <th key={f} scope="col">
                  {f.toFixed(1)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">bare glass</th>
              {p.bare.map((d, i) => (
                <td key={i}>{d}</td>
              ))}
            </tr>
            <tr>
              <th scope="row">silanized glass</th>
              {p.sil.map((d, i) => (
                <td key={i}>{d}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </>
  ),
  figure: (p) => (
    <figure className="figure">
      <div className="sim-grid">
        <SurfaceGroups />
        <AnglePlot p={p} />
      </div>
      <figcaption>
        <span className="figure-label">Figure.</span> Left: surface groups of bare glass (silanol Si–OH, siloxane
        bridges) and silanized glass (Si–CH₃). Right: δ against f<sub>ethanol</sub>, open circles bare, filled
        silanized, error bars about ±3°.
      </figcaption>
    </figure>
  ),
  parts: parts12,
  extra: (_p, part, inputs) => (part === 'b' ? <GammaSLPlot inputs={inputs} /> : null),
}

// ---------- 1.3 ----------

const TYPE_NAME = ['i', 'ii', 'iii']

const def13: ExerciseDef<Ex13> = {
  original: EX13,
  randomize: randomize13,
  task: (p) => (
    <>
      <p>
        The drainage and imbibition of a real pore system can be approximated by a suitable combination of cylindrical
        capillaries. The construction has four capillaries (I to IV), each made of three subunits stacked vertically.
        There are three subunit types (i, ii, iii) with different radii. Pressure p<sub>0</sub> + Δp acts at the top; p
        <sub>0</sub> acts at the bottom through a membrane permeable to the wetting fluid only.
      </p>
      <ul className="ex-data">
        <li>
          Water: ρ = 1000 kg/m³, γ = {fmt(p.gamma * 1e3)} × 10⁻³ N/m, δ = 0°, g = 9.81 m/s²
        </li>
        <li>
          Subunit radii: r<sub>i</sub> = {fmt(p.r[0] * 1e6)} µm, r<sub>ii</sub> = {fmt(p.r[1] * 1e6)} µm, r<sub>iii</sub> ={' '}
          {fmt(p.r[2] * 1e6)} µm; subunit height h = {fmt(p.height * 1e3)} mm
        </li>
        <li>Geometry (top → bottom): I iii–ii–i; II i–ii–iii; III i–ii–i; IV ii–i–ii</li>
      </ul>
    </>
  ),
  figure: (p) => (
    <figure className="figure">
      <div className="ex-networks">
        <div>
          <NetworkView net={network13(p)} filled={network13(p).columns.flat().map(() => true)} label="Pore system of four columns of three subunits, without interconnections." />
          <p className="note">(b) without interconnections</p>
        </div>
        <div>
          <NetworkView net={network13(p, true)} filled={network13(p).columns.flat().map(() => true)} label="The same pore system with the ii subunits interconnected." />
          <p className="note">(d) ii subunits interconnected</p>
        </div>
      </div>
      <figcaption>
        <span className="figure-label">Figure.</span> Columns I–IV (top → bottom), subunit width ∝ r<sub>c</sub>:{' '}
        {[0, 1, 2].map((t) => `${TYPE_NAME[t]} = ${fmt(p.r[t] * 1e6)} µm`).join(', ')}. Both start filled with water.
      </figcaption>
    </figure>
  ),
  parts: parts13,
  extra: (p, part) =>
    part === 'b' ? (
      <details className="ex-details">
        <summary>Step Δp in the pore-network simulator (shows the answer)</summary>
        <PoreNetworkSim
          idPrefix="ex13"
          figure={1}
          fluid={{ gamma: p.gamma, delta: 0 }}
          presets={[
            { id: 'b', label: 'Exercise 1.3 (b): no interconnections', net: network13(p) },
            { id: 'd', label: 'Exercise 1.3 (d): ii subunits interconnected', net: network13(p, true) },
          ]}
        />
      </details>
    ) : null,
}

// ---------- 1.4 ----------

function SensorFigure() {
  const arrays = [
    { d: 4, filled: true },
    { d: 7, filled: true },
    { d: 11, filled: false },
    { d: 16, filled: false },
  ]
  return (
    <svg viewBox="0 0 440 170" className="tensio-svg" role="img" aria-label="A hydrophobic substrate with four arrays of shallow cylindrical pores of increasing diameter; the arrays of small pores are filled with condensed water, the large ones are empty.">
      <rect x="10" y="60" width="420" height="70" className="tensio-metal" />
      {arrays.map((a, k) => {
        const x0 = 25 + k * 105
        return (
          <g key={k}>
            {[0, 1, 2, 3].map((j) => {
              const x = x0 + j * (a.d + 8)
              return <rect key={j} x={x} y={60} width={a.d} height={22} className={a.filled ? 'ex-pore-filled' : 'ex-pore-empty'} />
            })}
            <text x={x0 + 30} y={150} textAnchor="middle" className="tensio-note">
              {a.filled ? 'filled' : 'empty'}
            </text>
          </g>
        )
      })}
      <text x="220" y="40" textAnchor="middle" className="tensio-note">humid air (relative humidity RH = p/p₀)</text>
      <path d="M30 22 H410" className="tensio-arrow" markerEnd="url(#ex-right)" />
      <text x="220" y="16" textAnchor="middle" className="tensio-note">pore diameter increases →</text>
      <defs>
        <marker id="ex-right" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0 0 L10 5 L0 10 Z" className="tensio-arrowhead" />
        </marker>
      </defs>
    </svg>
  )
}

const def14: ExerciseDef<Ex14> = {
  original: EX14,
  randomize: randomize14,
  task: () => (
    <>
      <p>
        An optical humidity sensor is made by patterning a hydrophobic substrate with arrays of shallow, cylindrical
        surface pores. Pores within an array are identical in diameter. When the pores in an array fill with water by
        condensation from the air, the optical appearance changes, so it is easy to see which arrays have empty and
        which have filled pores.
      </p>
      <ul className="ex-data">
        <li>The inner surface of the pores is hydrophilic.</li>
        <li>The meniscus in filled pores is hemispherical, with radius ≈ pore radius.</li>
        <li>RH ≈ the pressure ratio p/p₀ predicted by the Kelvin equation at the curved interface.</li>
        <li>
          γ(T) = 121.5 mN/m − 0.1662 mN m⁻¹ K⁻¹ × T (T in K); R = 8.3145 J K⁻¹ mol⁻¹; V<sub>m</sub> = 18 cm³/mol (constant).
        </li>
      </ul>
    </>
  ),
  figure: () => (
    <figure className="figure tensio-figure">
      <SensorFigure />
      <figcaption>
        <span className="figure-label">Figure.</span> Pore arrays of different diameter; at a given humidity the small
        pores are filled (coloured) and the large ones empty.
      </figcaption>
    </figure>
  ),
  parts: parts14,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const EXERCISES: Record<string, ExerciseDef<any>> = {
  'exercise-1-1': def11,
  'exercise-1-2': def12,
  'exercise-1-3': def13,
  'exercise-1-4': def14,
}
