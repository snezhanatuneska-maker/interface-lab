import { useState } from 'react'
import { Segmented, Slider } from '../components/Controls'
import {
  cassieAngle,
  AR_DEFAULT,
  AR_RANGE,
  criticalAngle,
  DELTA_DEFAULT,
  DELTA_RANGE,
  favoredState,
  FSOLID_DEFAULT,
  FSOLID_RANGE,
  GAMMA_LG_RANGE,
  GAMMA_RANGE,
  GAMMA_SG_DEFAULT,
  GAMMA_SL_DEFAULT,
  GAMMA_WATER,
  PRESETS,
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
  { value: 'cassie', label: 'Cassie–Baxter', title: 'Cassie–Baxter: gas under the drop' },
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
    { cls: 'air', label: 'trapped gas' },
    { cls: 'solid', label: 'textured solid' },
  ],
}

export default function WettingPage() {
  const [mode, setMode] = useState<InputMode>('angle')
  const [deltaSet, setDeltaSet] = useState(DELTA_DEFAULT)
  const [gSG, setGSG] = useState(GAMMA_SG_DEFAULT)
  const [gSL, setGSL] = useState(GAMMA_SL_DEFAULT)
  const [gLG, setGLG] = useState(GAMMA_WATER)
  const [Ar, setAr] = useState(AR_DEFAULT)
  const [fSolid, setFSolid] = useState(FSOLID_DEFAULT)
  const [view, setView] = useState<Surface>('wenzel')

  const young = youngFromTensions(gSG, gSL, gLG)
  const deltaSmooth = mode === 'angle' ? deltaSet : young.delta
  const angles = { smooth: deltaSmooth, wenzel: wenzelAngle(deltaSmooth, Ar), cassie: cassieAngle(deltaSmooth, fSolid) }
  const crit = criticalAngle(Ar, fSolid)
  const favored = favoredState(deltaSmooth, Ar, fSolid)

  const reset = () => {
    setMode('angle')
    setDeltaSet(DELTA_DEFAULT)
    setGSG(GAMMA_SG_DEFAULT)
    setGSL(GAMMA_SL_DEFAULT)
    setGLG(GAMMA_WATER)
    setAr(AR_DEFAULT)
    setFSolid(FSOLID_DEFAULT)
    setView('wenzel')
  }

  const applyPreset = (p: Preset) => {
    setMode('angle')
    setDeltaSet(p.delta)
    setAr(p.Ar)
    setFSolid(p.fSolid)
    setView(favoredState(p.delta, p.Ar, p.fSolid)) // show the state this surface actually takes
  }

  const delta = angles[view]
  const wet = wettability(delta)
  const v = VIEWS.find((x) => x.value === view)!

  return (
    <article className="page">
      <header className="page-intro">
        <a className="back-link" href="#/">
          ← All tools
        </a>
        <h1>Wetting &amp; Contact Angle: Young, Wenzel, Cassie–Baxter</h1>
        <p className="lede">
          The contact angle δ is the angle between the solid and the liquid–gas interface, measured through the
          liquid, where they meet. δ &lt; 90° is hydrophilic (the liquid wets), δ &gt; 90° is hydrophobic, and δ &gt;
          150° with low contact-angle hysteresis (drops roll off at a tilt of less than about 10°) is
          superhydrophobic. A smooth
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
                delta={delta}
                surface={view}
                Ar={Ar}
                fSolid={fSolid}
                label={`${v.title}: contact angle δ ${Math.round(delta)} degrees, ${wet}`}
              />
            </div>
            <div className="drop-readout">
              <span className="drop-angle">δ = {Math.round(delta)}°</span>
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
                <>With A<sub>r</sub> = 1 and f<sub>solid</sub> = 1 both models give Young's angle.</>
              ) : favored === 'cassie' ? (
                <>
                  <span className="cassie-ink">Cassie–Baxter</span>: δ<sub>smooth</sub> = {Math.round(deltaSmooth)}° is
                  above δ<sub>c</sub> = {Math.round(crit)}°, so gas stays trapped.
                </>
              ) : (
                <>
                  <span className="wenzel-ink">Wenzel</span>: δ<sub>smooth</sub> = {Math.round(deltaSmooth)}° is below δ
                  <sub>c</sub> = {Math.round(crit)}°, so liquid fills the grooves.
                </>
              )}
            </p>
            <p>
              Wenzel drops are “sticky” (pinned in the grooves); Cassie–Baxter drops roll off easily. The comparison
              is of energies: below δ<sub>c</sub> a Cassie–Baxter state can still survive as a metastable state, until a
              push, drop impact or evaporation makes the liquid collapse into the grooves.
            </p>
            {view === 'cassie' && deltaSmooth < 90 && (
              <p>
                With δ<sub>smooth</sub> &lt; 90° no gas stays trapped: the liquid wicks into the texture, so the
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
                  { value: 'angle', label: <>Set δ directly</> },
                  { value: 'tension', label: 'Surface tensions' },
                ]}
              />
            </div>
            {mode === 'angle' ? (
              <Slider
                id="deltaSmooth"
                label={<>Young angle <em>δ</em> (smooth)</>}
                value={`${deltaSet}°`}
                min={DELTA_RANGE[0]}
                max={DELTA_RANGE[1]}
                step={1}
                pos={deltaSet}
                onChange={setDeltaSet}
                hint="smooth surfaces: at most about 120° for water"
              />
            ) : (
              <>
                <Slider
                  id="gSG"
                  label={<>γ<sub>sg</sub></>}
                  value={`${gSG.toFixed(1)} mN/m`}
                  min={GAMMA_RANGE[0]}
                  max={GAMMA_RANGE[1]}
                  step={0.5}
                  pos={gSG}
                  onChange={setGSG}
                />
                <Slider
                  id="gSL"
                  label={<>γ<sub>sl</sub></>}
                  value={`${gSL.toFixed(1)} mN/m`}
                  min={GAMMA_RANGE[0]}
                  max={GAMMA_RANGE[1]}
                  step={0.5}
                  pos={gSL}
                  onChange={setGSL}
                />
                <Slider
                  id="gLG"
                  label={<>γ<sub>lg</sub></>}
                  value={`${gLG.toFixed(1)} mN/m`}
                  min={GAMMA_LG_RANGE[0]}
                  max={GAMMA_LG_RANGE[1]}
                  step={0.1}
                  pos={gLG}
                  onChange={setGLG}
                  hint="water: 72 mN/m"
                />
                <p className={`wet-young${young.limit ? ' limit' : ''}`} aria-live="polite">
                  {young.limit ? (
                    <>
                      |γ<sub>sg</sub> − γ<sub>sl</sub>| &gt; γ<sub>lg</sub>: <strong>{young.limit}</strong> (δ ={' '}
                      {Math.round(young.delta)}°)
                    </>
                  ) : (
                    <>
                      cos δ = {young.cos.toFixed(3)} → δ = <strong>{young.delta.toFixed(1)}°</strong>
                    </>
                  )}
                </p>
              </>
            )}
            <Slider
              id="rough"
              label={<>Roughness ratio <em>A</em><sub>r</sub></>}
              value={Ar.toFixed(2)}
              min={AR_RANGE[0]}
              max={AR_RANGE[1]}
              step={0.05}
              pos={Ar}
              onChange={setAr}
              hint="Wenzel; 1 = smooth"
              className={view === 'wenzel' ? undefined : 'inactive'}
            />
            <Slider
              id="fsolid"
              label={<>Solid fraction <em>f</em><sub>solid</sub></>}
              value={fSolid.toFixed(2)}
              min={FSOLID_RANGE[0]}
              max={FSOLID_RANGE[1]}
              step={0.01}
              pos={fSolid}
              onChange={setFSolid}
              hint="Cassie–Baxter; 1 = no gas"
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
            tangent at the contact point. The texture is drawn enlarged; deeper grooves mean larger A<sub>r</sub>, thinner
            pillars mean smaller f<sub>solid</sub>.
          </figcaption>
        </figure>
      </section>

      <section className="section" aria-labelledby="why-title">
        <h2 id="why-title" className="section-title">
          Why it matters
        </h2>
        <ul className="why-list">
          <li>
            <strong>PEM fuel cells.</strong> The gas diffusion layer is carbon paper treated with PTFE, which raises δ above
            90°. On the rough fibres Wenzel makes it even more water-repellent, so product water is
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
