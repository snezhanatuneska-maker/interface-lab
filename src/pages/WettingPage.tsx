import { useMemo, useState, type ReactNode } from 'react'
import type { Annotation, Data, Shape } from 'plotly.js'
import Plot from '../components/Plot'
import { Segmented, Slider } from '../components/Controls'
import { useThemeColors } from '../lib/themeColors'
import { axis, baseLayout, staticConfig } from '../lib/plotTheme'
import {
  cassieAngle,
  criticalAngle,
  favoredState,
  FS_DEFAULT,
  FS_RANGE,
  GAMMA_LV_RANGE,
  GAMMA_RANGE,
  GAMMA_SL_DEFAULT,
  GAMMA_SV_DEFAULT,
  GAMMA_WATER,
  PRESETS,
  R_DEFAULT,
  R_RANGE,
  THETA_DEFAULT,
  THETA_RANGE,
  wenzelAngle,
  wettability,
  youngFromTensions,
  type InputMode,
  type Preset,
} from '../lib/wetting'
import DropView, { type Surface } from './wetting/DropView'
import Theory from './wetting/Theory'
import Quiz from './wetting/Quiz'

const PANELS: { surface: Surface; title: string; sub: string }[] = [
  { surface: 'smooth', title: 'Young', sub: 'smooth' },
  { surface: 'wenzel', title: 'Wenzel', sub: 'liquid in the grooves' },
  { surface: 'cassie', title: 'Cassie–Baxter', sub: 'air under the drop' },
]

const CEP: { title: string; preset: Preset['id']; text: ReactNode }[] = [
  {
    title: 'PEM fuel cells',
    preset: 'ptfe',
    text: (
      <>
        The gas diffusion layer is carbon paper treated with PTFE, which raises θ<sub>Y</sub> above 90°. On the rough
        fibres Wenzel then makes it even more water-repellent, so product water is pushed out, the pores do not flood
        and gas still reaches the catalyst layer.
      </>
    ),
  },
  {
    title: 'Water electrolysis',
    preset: 'glass',
    text:
      'Electrodes that wet well (hydrophilic, "aerophobic") let H₂ and O₂ bubbles detach small and fast. Roughness ' +
      'on a hydrophilic surface lowers the angle further (Wenzel), freeing active area and lowering the overpotential.',
  },
  {
    title: 'Self-cleaning solar panels',
    preset: 'lotus',
    text:
      'Lotus-effect coatings hold drops in the Cassie–Baxter state, above 150°. The drops roll off and pick up dust ' +
      'on the way, so PV output stays high with less cleaning.',
  },
]

const N = 181

export default function WettingPage() {
  const [mode, setMode] = useState<InputMode>('angle')
  const [thetaSet, setThetaSet] = useState(THETA_DEFAULT)
  const [gSV, setGSV] = useState(GAMMA_SV_DEFAULT)
  const [gSL, setGSL] = useState(GAMMA_SL_DEFAULT)
  const [gLV, setGLV] = useState(GAMMA_WATER)
  const [r, setR] = useState(R_DEFAULT)
  const [fs, setFs] = useState(FS_DEFAULT)
  const theme = useThemeColors()

  const young = youngFromTensions(gSV, gSL, gLV)
  const thetaY = mode === 'angle' ? thetaSet : young.theta
  const angles = { smooth: thetaY, wenzel: wenzelAngle(thetaY, r), cassie: cassieAngle(thetaY, fs) }
  const crit = criticalAngle(r, fs)
  const favored = favoredState(thetaY, r, fs)

  const reset = () => {
    setMode('angle')
    setThetaSet(THETA_DEFAULT)
    setGSV(GAMMA_SV_DEFAULT)
    setGSL(GAMMA_SL_DEFAULT)
    setGLV(GAMMA_WATER)
    setR(R_DEFAULT)
    setFs(FS_DEFAULT)
  }

  const applyPreset = (p: Preset, scroll = false) => {
    setMode('angle')
    setThetaSet(p.thetaY)
    setR(p.r)
    setFs(p.fs)
    if (scroll) document.getElementById('sim-figure')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // ---------- Chart: apparent angle against θ_Y ----------
  const curves = useMemo(() => {
    const xs: number[] = []
    const w: number[] = []
    const cb: number[] = []
    for (let i = 0; i < N; i++) {
      xs.push(i)
      w.push(wenzelAngle(i, r))
      cb.push(cassieAngle(i, fs))
    }
    return { xs, w, cb }
  }, [r, fs])

  const C = { young: theme.muted, wenzel: theme.data1, cassie: theme.data2 }
  const line = (on: boolean, color: string) => ({ color, width: on ? 3 : 2 })

  const chartData: Data[] = [
    { x: [0, 180], y: [0, 180], type: 'scatter', mode: 'lines', line: { color: C.young, width: 2, dash: 'dash' } },
    { x: curves.xs, y: curves.w, type: 'scatter', mode: 'lines', line: line(favored === 'wenzel', C.wenzel) },
    { x: curves.xs, y: curves.cb, type: 'scatter', mode: 'lines', line: line(favored === 'cassie', C.cassie) },
    {
      x: [thetaY, thetaY, thetaY],
      y: [angles.smooth, angles.wenzel, angles.cassie],
      type: 'scatter',
      mode: 'markers',
      marker: { size: 11, color: [C.young, C.wenzel, C.cassie], line: { color: theme.plotBg, width: 2 } },
    },
  ]

  const ref = (y: number): Partial<Shape> => ({
    type: 'line',
    xref: 'paper',
    x0: 0,
    x1: 1,
    y0: y,
    y1: y,
    layer: 'below',
    line: { color: theme.axis, width: 1, dash: 'dot' },
  })
  const shapes: Partial<Shape>[] = [ref(90), ref(150)]
  const annotations: Partial<Annotation>[] = [
    { xref: 'paper', x: 0, y: 150, xanchor: 'left', yanchor: 'bottom', text: '150°', showarrow: false, font: { size: 11, color: theme.muted } },
  ]
  if (crit !== null) {
    shapes.push(
      { type: 'rect', xref: 'x', yref: 'paper', x0: crit, x1: 180, y0: 0, y1: 1, layer: 'below', fillcolor: theme.data2Soft, line: { width: 0 } },
      { type: 'line', xref: 'x', yref: 'paper', x0: crit, x1: crit, y0: 0, y1: 1, line: { color: theme.text, width: 1.5, dash: 'dash' } },
    )
    annotations.push({
      x: crit,
      y: 8,
      xanchor: crit > 160 ? 'right' : 'left',
      xshift: crit > 160 ? -4 : 4,
      yanchor: 'bottom',
      text: `θ<sub>c</sub> = ${Math.round(crit)}°`,
      showarrow: false,
      font: { size: 12, color: theme.text },
    })
  }

  const chartLabel =
    `Apparent angle against Young angle, 0 to 180 degrees. At θ_Y ${Math.round(thetaY)}°: Wenzel ${Math.round(angles.wenzel)}°, ` +
    `Cassie–Baxter ${Math.round(angles.cassie)}°.` +
    (crit !== null ? ` Critical angle ${Math.round(crit)}°.` : '')

  return (
    <article className="page">
      <header className="page-intro">
        <a className="back-link" href="#/">
          ← All tools
        </a>
        <h1>Wetting &amp; Contact Angle: Young, Wenzel, Cassie–Baxter</h1>
        <p className="lede">
          The contact angle θ is the angle between the solid and the liquid surface, measured through the drop, where
          they meet. θ &lt; 90° is hydrophilic (the liquid wets), θ &gt; 90° is hydrophobic, and θ &gt; 150° is
          superhydrophobic.
        </p>
      </header>

      <Theory />

      {/* ---------- Simulation ---------- */}
      <section className="section" aria-labelledby="sim-title">
        <h2 id="sim-title" className="section-title">
          Simulation
        </h2>
        <figure id="sim-figure" className="figure" aria-label="Droplets and apparent contact angle">
          <ul className="drop-grid" aria-live="polite">
            {PANELS.map((p) => {
              const th = angles[p.surface]
              const wet = wettability(th)
              const isFav = p.surface !== 'smooth' && p.surface === favored && crit !== null
              return (
                <li key={p.surface} className={`drop-panel ${p.surface}${isFav ? ' favored' : ''}`}>
                  <h3>
                    {p.title} <span className="drop-sub">{p.sub}</span>
                  </h3>
                  <div className="surface-wrap">
                    <DropView
                      theta={th}
                      surface={p.surface}
                      r={r}
                      fs={fs}
                      label={`${p.title}: contact angle ${Math.round(th)} degrees, ${wet}`}
                    />
                  </div>
                  <p className="drop-angle">{Math.round(th)}°</p>
                  <span className={`wet-badge ${wet}`}>{wet}</span>
                  {isFav && <span className="drop-fav">favored</span>}
                </li>
              )
            })}
          </ul>

          <div className="insight wet-state" aria-live="polite">
            <p>
              <strong>Which state is favored?</strong>{' '}
              {crit === null ? (
                <>With r = 1 and f<sub>s</sub> = 1 both models give Young's angle.</>
              ) : favored === 'cassie' ? (
                <>
                  <span className="cassie-ink">Cassie–Baxter</span>: θ<sub>Y</sub> = {Math.round(thetaY)}° is above
                  θ<sub>c</sub> = {Math.round(crit)}°, so air stays trapped.
                </>
              ) : (
                <>
                  <span className="wenzel-ink">Wenzel</span>: θ<sub>Y</sub> = {Math.round(thetaY)}° is below θ
                  <sub>c</sub> = {Math.round(crit)}°, so liquid fills the grooves.
                </>
              )}
            </p>
            <p>Wenzel drops are “sticky” (pinned in the grooves); Cassie–Baxter drops roll off easily.</p>
          </div>

          <div className="figure-controls wet-controls">
            <div className="wet-control-row">
              <span className="control-label">Young angle from</span>
              <Segmented
                label="Young angle from"
                value={mode}
                onChange={setMode}
                options={[
                  { value: 'angle', label: <>Set θ<sub>Y</sub> directly</> },
                  { value: 'tension', label: 'Surface tensions' },
                ]}
              />
            </div>
            {mode === 'angle' ? (
              <Slider
                id="thetaY"
                label={<>Young angle <em>θ</em><sub>Y</sub></>}
                value={`${thetaSet}°`}
                min={THETA_RANGE[0]}
                max={THETA_RANGE[1]}
                step={1}
                pos={thetaSet}
                onChange={setThetaSet}
              />
            ) : (
              <>
                <Slider
                  id="gSV"
                  label={<>γ<sub>SV</sub></>}
                  value={`${gSV.toFixed(1)} mN/m`}
                  min={GAMMA_RANGE[0]}
                  max={GAMMA_RANGE[1]}
                  step={0.5}
                  pos={gSV}
                  onChange={setGSV}
                />
                <Slider
                  id="gSL"
                  label={<>γ<sub>SL</sub></>}
                  value={`${gSL.toFixed(1)} mN/m`}
                  min={GAMMA_RANGE[0]}
                  max={GAMMA_RANGE[1]}
                  step={0.5}
                  pos={gSL}
                  onChange={setGSL}
                />
                <Slider
                  id="gLV"
                  label={<>γ<sub>LV</sub></>}
                  value={`${gLV.toFixed(1)} mN/m`}
                  min={GAMMA_LV_RANGE[0]}
                  max={GAMMA_LV_RANGE[1]}
                  step={0.1}
                  pos={gLV}
                  onChange={setGLV}
                  hint="water: 72.8 mN/m"
                />
                <p className={`wet-young${young.limit ? ' limit' : ''}`} aria-live="polite">
                  {young.limit ? (
                    <>
                      |γ<sub>SV</sub> − γ<sub>SL</sub>| &gt; γ<sub>LV</sub>: <strong>{young.limit}</strong> (θ
                      <sub>Y</sub> = {Math.round(young.theta)}°)
                    </>
                  ) : (
                    <>
                      cos θ<sub>Y</sub> = {young.cos.toFixed(3)} → θ<sub>Y</sub> = <strong>{young.theta.toFixed(1)}°</strong>
                    </>
                  )}
                </p>
              </>
            )}
            <Slider
              id="rough"
              label={<>Roughness <em>r</em></>}
              value={r.toFixed(2)}
              min={R_RANGE[0]}
              max={R_RANGE[1]}
              step={0.05}
              pos={r}
              onChange={setR}
              hint="Wenzel; 1 = smooth"
            />
            <Slider
              id="fs"
              label={<>Solid fraction <em>f</em><sub>s</sub></>}
              value={fs.toFixed(2)}
              min={FS_RANGE[0]}
              max={FS_RANGE[1]}
              step={0.01}
              pos={fs}
              onChange={setFs}
              hint="Cassie–Baxter; 1 = no air"
            />
            <div className="sim-buttons wet-presets">
              {PRESETS.map((p) => (
                <button key={p.id} type="button" className="button" onClick={() => applyPreset(p)}>
                  {p.label}
                </button>
              ))}
              <button type="button" className="button" onClick={reset}>
                Reset
              </button>
            </div>
          </div>

          <div className="wet-chart">
            <ul className="plot-legend" aria-label="Plot legend">
              <li>
                <span className="key-line dashed" style={{ borderColor: C.young }} /> Young (θ* = θ<sub>Y</sub>)
              </li>
              <li>
                <span className="key-line" style={{ borderColor: C.wenzel }} /> Wenzel, r = {r.toFixed(2)}
              </li>
              <li>
                <span className="key-line" style={{ borderColor: C.cassie }} /> Cassie–Baxter, f<sub>s</sub> ={' '}
                {fs.toFixed(2)}
              </li>
              {crit !== null && (
                <li>
                  <span className="key-swatch" /> Cassie–Baxter favored (θ<sub>Y</sub> &gt; θ<sub>c</sub>)
                </li>
              )}
            </ul>
            <div role="img" aria-label={chartLabel}>
              <Plot
                data={chartData}
                layout={{
                  ...baseLayout(theme),
                  showlegend: false,
                  xaxis: { ...axis(theme), title: { text: 'Young angle θ<sub>Y</sub> (°)' }, range: [0, 180], dtick: 30 },
                  yaxis: { ...axis(theme), title: { text: 'Apparent angle θ* (°)' }, range: [0, 180], dtick: 30 },
                  shapes,
                  annotations,
                }}
                config={staticConfig}
                useResizeHandler
                className="plot"
              />
            </div>
          </div>
          <figcaption>
            <span className="figure-label">Figure 1.</span> Top: the same drop volume on a smooth, a Wenzel and a
            Cassie–Baxter surface, with the tangent at the contact point. Bottom: apparent angle against θ
            <sub>Y</sub>; the dots are the current setting. Right of the dashed line θ<sub>c</sub>, Cassie–Baxter has
            the lower energy.
          </figcaption>
        </figure>
      </section>

      {/* ---------- Clean energy ---------- */}
      <section className="section" aria-labelledby="cep-title">
        <h2 id="cep-title" className="section-title">
          Why this matters in clean energy processes
        </h2>
        <ul className="wet-cep-grid">
          {CEP.map((c) => {
            const p = PRESETS.find((x) => x.id === c.preset)!
            return (
              <li key={c.title} className="card wet-cep-card">
                <h3>{c.title}</h3>
                <p>{c.text}</p>
                <button type="button" className="button" onClick={() => applyPreset(p, true)}>
                  Load preset: {p.label}
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <Quiz />
    </article>
  )
}
