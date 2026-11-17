import { useMemo, useState } from 'react'
import type { Data } from 'plotly.js'
import Plot from './Plot'
import { Segmented, Slider } from './Controls'
import { axis, baseLayout, staticConfig } from '../lib/plotTheme'
import { useThemeColors } from '../lib/themeColors'
import { pointAt, pressureCurves, type CurvePoint, type Fluid, type PoreNetwork } from '../lib/poreNetwork'

// Interactive capillary pressure curve (lecture 4.3): a pore network of cylindrical subunits, a Δp slider, the
// drainage/imbibition switch and the S–Δp diagram with both curves. Used on #/capillary and by Exercise 1.3.

export interface NetworkPreset {
  id: string
  label: string
  net: PoreNetwork
  note?: string
}

type Process = 'drainage' | 'imbibition'

const BAR = 1e5
const WATER: Fluid = { gamma: 0.072, delta: 0 }
const fmtBar = (pa: number) => (pa / BAR).toFixed(2)
const fmtR = (r: number) => `${Number((r * 1e6).toPrecision(2))} µm`

/** Staircase through a piecewise-constant curve, as x = S, y = Δp (bar). */
function staircase(curve: CurvePoint[]) {
  const x: number[] = []
  const y: number[] = []
  for (const p of curve) {
    x.push(p.S, p.S)
    y.push(p.from / BAR, p.to / BAR)
  }
  return { x, y }
}

// ---------- Network drawing ----------

const COL_W = 64
const ROW_H = 46
const PAD_TOP = 34
const PAD_BOTTOM = 34

function NetworkView({ net, filled, label }: { net: PoreNetwork; filled: boolean[]; label: string }) {
  const rMax = Math.max(...net.columns.flat())
  const rows = Math.max(...net.columns.map((c) => c.length))
  const W = Math.max(net.columns.length * COL_W + 40, 220)
  const H = PAD_TOP + rows * ROW_H + PAD_BOTTOM
  const x0 = (W - net.columns.length * COL_W) / 2
  const cx = (c: number) => x0 + c * COL_W + COL_W / 2
  const cy = (k: number) => PAD_TOP + k * ROW_H + ROW_H / 2
  const width = (r: number) => 8 + (COL_W - 22) * (r / rMax)
  let n = 0
  const index = net.columns.map((col) => col.map(() => n++))
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="network-svg">
      <rect x={0} y={0} width={W} height={PAD_TOP - 6} className="net-gas" />
      <text x={W / 2} y={18} textAnchor="middle" className="net-label">
        gas, p₀ + Δp
      </text>
      <rect x={x0 - 8} y={PAD_TOP - 6} width={net.columns.length * COL_W + 16} height={rows * ROW_H + 12} className="net-solid" />
      {(net.links ?? []).map(([[c1, k1], [c2, k2]], i) => (
        <line key={i} x1={cx(c1)} y1={cy(k1)} x2={cx(c2)} y2={cy(k2)} className="net-link" />
      ))}
      {net.columns.map((col, c) =>
        col.map((r, k) => {
          const w = width(r)
          const on = filled[index[c][k]]
          return (
            <g key={`${c}-${k}`}>
              <rect x={cx(c) - w / 2} y={PAD_TOP + k * ROW_H - 6} width={w} height={ROW_H + (k === col.length - 1 ? 12 : 0)} className={on ? 'net-liquid' : 'net-empty'}>
                <title>{`column ${c + 1}, subunit ${k + 1}: r_c = ${fmtR(r)}, ${on ? 'filled' : 'empty'}`}</title>
              </rect>
            </g>
          )
        }),
      )}
      {net.columns.map((_, c) => (
        <text key={c} x={cx(c)} y={PAD_TOP - 12} textAnchor="middle" className="net-col">
          {['I', 'II', 'III', 'IV', 'V', 'VI'][c] ?? c + 1}
        </text>
      ))}
      <line x1={x0 - 8} x2={x0 + net.columns.length * COL_W + 8} y1={H - PAD_BOTTOM + 6} y2={H - PAD_BOTTOM + 6} className="net-membrane" />
      <text x={W / 2} y={H - 8} textAnchor="middle" className="net-label">
        membrane (wetting liquid only), p₀
      </text>
    </svg>
  )
}

// ---------- Simulator ----------

interface Props {
  presets: NetworkPreset[]
  fluid?: Fluid
  /** Figure number shown in the caption. */
  figure?: number
  idPrefix?: string
}

export default function PoreNetworkSim({ presets, fluid = WATER, figure = 2, idPrefix = 'net' }: Props) {
  const theme = useThemeColors()
  const [presetId, setPresetId] = useState(presets[0].id)
  const [process, setProcess] = useState<Process>('drainage')
  const preset = presets.find((p) => p.id === presetId) ?? presets[0]
  const curves = useMemo(() => pressureCurves(preset.net, fluid), [preset, fluid])
  const top = curves.drainage[curves.drainage.length - 1].to
  const [dpBar, setDpBar] = useState(0)
  const dp = Math.min(dpBar * BAR, top * 0.999)
  const current = pointAt(process === 'drainage' ? curves.drainage : curves.imbibition, dp)
  const other = pointAt(process === 'drainage' ? curves.imbibition : curves.drainage, dp)

  const choose = (id: string) => {
    setPresetId(id)
    setDpBar(0)
    setProcess('drainage')
  }
  const switchProcess = (p: Process) => {
    setProcess(p)
    setDpBar(p === 'drainage' ? 0 : Number((top / BAR).toFixed(2)))
  }

  const dr = staircase(curves.drainage)
  const im = staircase(curves.imbibition)
  const data: Data[] = [
    { ...dr, type: 'scatter', mode: 'lines', name: 'drainage', line: { color: theme.data1, width: 3 } },
    { ...im, type: 'scatter', mode: 'lines', name: 'imbibition', line: { color: theme.data2, width: 3, dash: 'dash' } },
    {
      x: [current.S],
      y: [dp / BAR],
      type: 'scatter',
      mode: 'markers',
      name: 'now',
      showlegend: false,
      cliponaxis: false,
      marker: { size: 12, color: process === 'drainage' ? theme.data1 : theme.data2, line: { color: theme.plotBg, width: 2 } },
    },
  ]

  return (
    <figure className="figure" aria-label="Pore-network simulator">
      <div className="net-controls">
        <div className="select">
          <label className="control-label" htmlFor={`${idPrefix}-preset`}>
            Pore system
          </label>
          <select id={`${idPrefix}-preset`} value={presetId} onChange={(e) => choose(e.target.value)}>
            {presets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <span className="control-label">Process</span>
          <Segmented
            label="Process"
            value={process}
            onChange={switchProcess}
            options={[
              { value: 'drainage', label: 'Drainage (start full)', activeClass: 'net-dr' },
              { value: 'imbibition', label: 'Imbibition (start empty)', activeClass: 'net-im' },
            ]}
          />
        </div>
      </div>

      <div className="net-grid">
        <NetworkView
          net={preset.net}
          filled={current.filled}
          label={`${preset.label}, ${process} at Δp = ${fmtBar(dp)} bar: saturation ${current.S.toFixed(2)}.`}
        />
        <div>
          <div role="img" aria-label={`Capillary pressure diagram: saturation S against Δp for drainage and imbibition. Now S = ${current.S.toFixed(2)} at ${fmtBar(dp)} bar.`}>
            <Plot
              data={data}
              layout={{
                ...baseLayout(theme),
                showlegend: true,
                xaxis: { ...axis(theme), title: { text: 'Saturation S = V<sub>wetting</sub>/V<sub>pore</sub>' }, range: [-0.03, 1.03] },
                yaxis: { ...axis(theme), title: { text: 'Δp (bar)' }, range: [0, (top / BAR) * 1.02] },
              }}
              config={staticConfig}
              useResizeHandler
              className="plot"
            />
          </div>
          <dl className="results" aria-live="polite">
            <div>
              <dt>Δp</dt>
              <dd>{fmtBar(dp)} bar</dd>
            </div>
            <div>
              <dt>S ({process})</dt>
              <dd>{current.S.toFixed(3)}</dd>
            </div>
            <div>
              <dt>S ({process === 'drainage' ? 'imbibition' : 'drainage'}) at the same Δp</dt>
              <dd>{other.S.toFixed(3)}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="figure-controls">
        <Slider
          id={`${idPrefix}-dp`}
          label={<>Applied pressure difference Δp</>}
          value={`${fmtBar(dp)} bar`}
          min={0}
          max={Number((top / BAR).toFixed(2))}
          step={0.01}
          pos={dpBar}
          onChange={setDpBar}
          hint={
            <>
              Subunit p<sub>c</sub>: {curves.thresholds.map((t) => fmtBar(t)).join(', ')} bar.{' '}
              {process === 'drainage' ? 'Raise Δp to drain.' : 'Lower Δp to fill.'}
            </>
          }
        />
        {preset.note && <p className="note">{preset.note}</p>}
      </div>

      <figcaption>
        <span className="figure-label">Figure {figure}.</span> Columns of cylindrical subunits (width ∝ r<sub>c</sub>;
        blue = wetting liquid, light = gas). Drainage: a subunit empties when Δp &gt; its p<sub>c</sub>, gas can reach it
        and its liquid still connects to the membrane; liquid cut off from the membrane stays trapped. Imbibition: a
        subunit fills from below when Δp &lt; its p<sub>c</sub>. Large pores empty first (drainage), small pores fill
        first (imbibition), so the imbibition curve lies below the drainage curve (hysteresis).
      </figcaption>
    </figure>
  )
}
