import { useState } from 'react'
import { Segmented, Slider } from '../components/Controls'
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

const VIEWS: { value: Surface; label: string; title: string }[] = [
  { value: 'smooth', label: 'Young', title: 'Young: smooth surface' },
  { value: 'wenzel', label: 'Wenzel', title: 'Wenzel: liquid in the grooves' },
  { value: 'cassie', label: 'Cassie–Baxter', title: 'Cassie–Baxter: air under the drop' },
]

const LEGEND: Record<Surface, { cls: string; label: string }[]> = {
  smooth: [
    { cls: 'liquid', label: 'liquid' },
    { cls: 'solid', label: 'solid' },
  ],
  wenzel: [
    { cls: 'liquid', label: 'liquid (also in the grooves)' },
    { cls: 'solid', label: 'rough solid' },
  ],
  cassie: [
    { cls: 'liquid', label: 'liquid' },
    { cls: 'air', label: 'trapped air' },
    { cls: 'solid', label: 'textured solid' },
  ],
}

export default function WettingPage() {
  const [mode, setMode] = useState<InputMode>('angle')
  const [thetaSet, setThetaSet] = useState(THETA_DEFAULT)
  const [gSV, setGSV] = useState(GAMMA_SV_DEFAULT)
  const [gSL, setGSL] = useState(GAMMA_SL_DEFAULT)
  const [gLV, setGLV] = useState(GAMMA_WATER)
  const [r, setR] = useState(R_DEFAULT)
  const [fs, setFs] = useState(FS_DEFAULT)
  const [view, setView] = useState<Surface>('wenzel')

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
    setView('wenzel')
  }

  const applyPreset = (p: Preset) => {
    setMode('angle')
    setThetaSet(p.thetaY)
    setR(p.r)
    setFs(p.fs)
    setView(favoredState(p.thetaY, p.r, p.fs)) // show the state this surface actually takes
  }

  const theta = angles[view]
  const wet = wettability(theta)
  const v = VIEWS.find((x) => x.value === view)!

  return (
    <article className="page">
      <header className="page-intro">
        <a className="back-link" href="#/">
          ← All tools
        </a>
        <h1>Wetting &amp; Contact Angle: Young, Wenzel, Cassie–Baxter</h1>
        <p className="lede">
          The contact angle θ is the angle between the solid and the liquid surface, measured through the drop, where
          they meet. θ &lt; 90° is hydrophilic (the liquid wets), θ &gt; 90° is hydrophobic, and θ &gt; 150° with low
          contact-angle hysteresis (drops roll off at a tilt of less than about 10°) is superhydrophobic. A smooth
          surface never gets water above about 120°: higher angles need roughness.
        </p>
      </header>

      <Theory />

      {/* ---------- Simulation ---------- */}
      <section className="section" aria-labelledby="sim-title">
        <h2 id="sim-title" className="section-title">
          Simulation
        </h2>
        <figure id="sim-figure" className="figure" aria-label="Droplet on the chosen surface">
          <div className="wet-view-head">
            <div className="wet-control-row">
              <span className="control-label">Show</span>
              <Segmented label="Wetting model shown" value={view} onChange={setView} options={VIEWS} />
            </div>
          </div>
          <div className={`drop-single ${view}`} aria-live="polite">
            <h3>{v.title}</h3>
            <div className="surface-wrap">
              <DropView
                theta={theta}
                surface={view}
                r={r}
                fs={fs}
                label={`${v.title}: contact angle ${Math.round(theta)} degrees, ${wet}`}
              />
            </div>
            <div className="drop-readout">
              <span className="drop-angle">θ = {Math.round(theta)}°</span>
              <span className={`wet-badge ${wet}`}>{wet}</span>
              {view !== 'smooth' && view === favored && crit !== null && <span className="tag">favored state</span>}
            </div>
            <ul className="layer-legend drop-legend" aria-label="Legend">
              {LEGEND[view].map((l) => (
                <li key={l.cls}>
                  <span className={`swatch ${l.cls}`} /> {l.label}
                </li>
              ))}
            </ul>
          </div>

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
            <p>
              Wenzel drops are “sticky” (pinned in the grooves); Cassie–Baxter drops roll off easily. The comparison
              is of energies: below θ<sub>c</sub> a Cassie–Baxter state can still survive as a metastable state, until a
              push, drop impact or evaporation makes the liquid collapse into the grooves.
            </p>
            {view === 'cassie' && thetaY < 90 && (
              <p>
                With θ<sub>Y</sub> &lt; 90° no air stays trapped: the liquid wicks into the texture, so the
                Cassie–Baxter angle shown here is not reached on a hydrophilic surface.
              </p>
            )}
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
                hint="smooth surfaces: at most about 120° for water"
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
                  hint="water: 72.0 mN/m at 25 °C"
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
              className={view === 'wenzel' ? undefined : 'inactive'}
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
              className={view === 'cassie' ? undefined : 'inactive'}
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

          <figcaption>
            <span className="figure-label">Figure 1.</span> The same drop volume on the chosen surface, with the
            tangent at the contact point. The texture is drawn enlarged; deeper grooves mean larger r, thinner pillars
            mean smaller f<sub>s</sub>.
          </figcaption>
        </figure>
      </section>

      <section className="section" aria-labelledby="why-title">
        <h2 id="why-title" className="section-title">
          Why it matters
        </h2>
        <ul className="why-list">
          <li>
            <strong>PEM fuel cells.</strong> The gas diffusion layer is carbon paper treated with PTFE, which raises θ
            <sub>Y</sub> above 90°. On the rough fibres Wenzel makes it even more water-repellent, so product water is
            pushed out, the pores do not flood and gas still reaches the catalyst layer.
          </li>
          <li>
            <strong>Water electrolysis.</strong> Electrodes that wet well (hydrophilic, “aerophobic”) let H<sub>2</sub>{' '}
            and O<sub>2</sub> bubbles detach small and fast. Roughness on a hydrophilic surface lowers the angle further
            (Wenzel), freeing active area and lowering the overpotential.
          </li>
          <li>
            <strong>Self-cleaning solar panels.</strong> Lotus-effect coatings hold drops in the Cassie–Baxter state,
            above 150°. The drops roll off and pick up dust on the way, so PV output stays high with less cleaning.
          </li>
        </ul>
      </section>
    </article>
  )
}
