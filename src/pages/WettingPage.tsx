import { useState } from 'react'
import { Segmented, Slider } from '../components/Controls'
import {
  cassieAngle,
  AR_DEFAULT,
  AR_RANGE,
  DELTA_DEFAULT,
  DELTA_RANGE,
  FSOLID_DEFAULT,
  FSOLID_RANGE,
  GAMMA_LG_RANGE,
  GAMMA_RANGE,
  GAMMA_SG_DEFAULT,
  GAMMA_SL_DEFAULT,
  GAMMA_WATER,
  PRESETS,
  spreadingCoefficient,
  wenzelAngle,
  WET_LABEL,
  wettability,
  youngFromTensions,
  type InputMode,
  type Preset,
} from '../lib/wetting'
import DropView, { type Surface } from './wetting/DropView'
import Tex from '../components/Tex'
import Theory from './wetting/Theory'
import HysteresisSim from './wetting/HysteresisSim'
import ReentrantSketch from './wetting/ReentrantSketch'

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
  const Sw = spreadingCoefficient(gSG, gSL, gLG)

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
    setView(p.view) // show the state this surface takes
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
        <h1>Wetting &amp; Contact Angle</h1>
        <p className="lede">
          The contact angle δ is the angle between the solid and the liquid–gas interface, measured through the
          liquid at the three-phase contact line. δ &lt; 90°: partially wetting (hydrophilic for water, oleophilic
          for oil, amphiphilic for many liquids). δ &gt; 90°: non-wetting (hydrophobic, oleophobic, omniphobic).
          Water with δ &gt; 150° and contact-angle hysteresis δ<sub>a</sub> − δ<sub>r</sub> &lt; 5° is
          superhydrophobic. A contact angle can be static (equilibrium) or dynamic, δ(t). A smooth
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
              <span className={`wet-badge ${wet}`}>{WET_LABEL[wet]}</span>
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
              Wenzel drops are “sticky” (pinned in the grooves); Cassie–Baxter drops roll off easily. A high calculated
              Cassie–Baxter angle does not mean that this state actually forms: see <a href="#cb-stability">Cassie–Baxter
              stability</a> below.
            </p>
            {view === 'cassie' && deltaSmooth < 90 && (
              <p>
                With δ<sub>smooth</sub> &lt; 90° on simple pillars no gas stays trapped: the liquid wicks into the
                texture, so the Cassie–Baxter angle shown here is not reached unless the texture is re-entrant.
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
                <p className={`wet-young${Sw > 0 ? ' limit' : ''}`} aria-live="polite">
                  S<sub>w</sub> = γ<sub>sg</sub> − γ<sub>sl</sub> − γ<sub>lg</sub> = <strong>{Sw.toFixed(1)} mN/m</strong>{' '}
                  <span className={`state-badge${Sw > 0 ? ' above' : ''}`}>
                    {Sw > 0 ? 'S_w > 0: spreads (dynamic wetting)' : 'S_w < 0: sessile drop (static)'}
                  </span>
                  <br />
                  {Sw > 0 ? (
                    <>No equilibrium contact angle: the liquid spreads into a film (δ → 0).</>
                  ) : young.limit ? (
                    <>
                      cos δ = {young.cos.toFixed(2)} &lt; −1: complete non-wetting (δ = 180°).
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

      {/* ---------- Contact-angle hysteresis ---------- */}
      <section className="section" aria-labelledby="hyst-title">
        <h2 id="hyst-title" className="section-title">
          Contact-angle hysteresis
        </h2>
        <div className="card-grid">
          <div className="card">
            <h3>Advancing and receding angle</h3>
            <p>
              On real surfaces the contact angle is not one number. The <strong>advancing angle δ<sub>a</sub></strong>{' '}
              (front of a drop that is about to move) is larger than the <strong>receding angle δ<sub>r</sub></strong>{' '}
              (rear): δ<sub>a</sub> ≥ δ<sub>r</sub>. Both are measured just before the drop starts to move on a tilted,
              previously unwetted surface. The difference δ<sub>a</sub> − δ<sub>r</sub> is the hysteresis.
            </p>
            <p>
              <strong>Causes:</strong> chemical inhomogeneity, asperities and pits, adsorbed molecules, particles and dust
              that pin the contact line.
            </p>
          </div>
          <div className="card eq-card">
            <h3>Retention force (Furmidge)</h3>
            <div className="formula">
              <div className="formula-body eq-math">
                <Tex display tex={String.raw`F = k\,w\,\gamma_{lg}(\cos\delta_r - \cos\delta_a)`} />
              </div>
            </div>
            <p className="note">
              w: lateral drop width; k = 1 for an ideal spherical cap. The drop slides when the downhill component of
              its weight, m g sin α, exceeds F. <strong>Why it matters:</strong> in coating and printing, hysteresis
              decides whether a wet line stays where it was put or dewets and beads up.
            </p>
          </div>
        </div>
        <HysteresisSim />
      </section>

      {/* ---------- Cassie–Baxter stability ---------- */}
      <section className="section" aria-labelledby="cb-stability">
        <h2 id="cb-stability" className="section-title">
          Cassie–Baxter stability and re-entrant structures
        </h2>
        <p className="prose">
          A high calculated Cassie–Baxter angle does not mean that the state actually forms. For liquids of low surface
          tension the global energy minimum is complete wetting of the texture (Wenzel); whether gas stays trapped
          depends on the geometry of the roughness and on the local contact angle δ at its edges.
        </p>
        <p className="prose">
          <strong>Re-entrant curvature</strong> (an overhang with ψ &lt; 90°, e.g. mushroom-shaped pillars) can hold a
          stable Cassie–Baxter state even for liquids with δ &lt; 90°: the meniscus hangs under the overhang with its
          local angle δ and cannot advance down the pillar. Such surfaces repel almost every liquid:{' '}
          <strong>super-omniphobic</strong>. Example: n-hexane on PTFE collapses to Wenzel on simple pillars but stays
          Cassie–Baxter on re-entrant structures.
        </p>
        <figure className="figure tensio-figure">
          <ReentrantSketch />
          <figcaption>
            <span className="figure-label">Figure 3.</span> The same low-γ liquid on simple pillars (left) and on
            re-entrant pillars (right).
          </figcaption>
        </figure>
      </section>

      {/* ---------- Lecture examples ---------- */}
      <section className="section" aria-labelledby="examples-title">
        <h2 id="examples-title" className="section-title">
          Wetting in nature and technology
        </h2>
        <div className="card-grid">
          <div className="card">
            <h3>Lotus effect</h3>
            <p>
              Lotus leaves are superhydrophobic: δ &gt; 150° with hysteresis δ<sub>a</sub> − δ<sub>r</sub> &lt; 5°. This
              comes from surface chemistry (hydrophobic wax) combined with micro- and nanoscale roughness, which holds
              water in the Cassie–Baxter state. Drops roll off and take dirt with them.
            </p>
            <p>
              Lotus leaves and bird feathers are <em>not</em> oleophobic. Why?
            </p>
            <details>
              <summary>Show the answer</summary>
              <p>
                Oils have a low γ<sub>lg</sub>, so their Young angle on the wax is below 90°, and the texture has no
                re-entrant geometry that could hold such a liquid in the Cassie–Baxter state. The oil wicks in.
              </p>
            </details>
          </div>
          <div className="card">
            <h3>Roughness amplifies chemistry</h3>
            <p>
              Gold coated with a pH-switchable carboxylic-acid monolayer (MUABA) changes its contact angle with pH. On
              smooth gold the change is small; on rough gold the same chemical switch gives a huge change in δ.
            </p>
            <p>
              In general roughness takes a hydrophilic surface to <strong>superhydrophilic</strong> and a hydrophobic one
              to <strong>superhydrophobic</strong> (Wenzel: A<sub>r</sub> multiplies cos δ).
            </p>
          </div>
          <div className="card">
            <h3>Liquid-infused “slippery” surfaces</h3>
            <p>
              A lubricant locked into the surface texture gives the drop a smooth liquid underlay. The contact line has
              nothing to pin on, so hysteresis is very low and drops slip off at small tilt.
            </p>
          </div>
          <div className="card">
            <h3>Bio-inspired water collection</h3>
            <p>
              The fog-basking beetle <em>Onymacris unguicularis</em> collects fog water on its back. Patterns of
              hydrophilic and hydrophobic regions and contact-angle gradients make drops grow and move to where they are
              wanted. Such patterns are used to design water-collecting surfaces; how this particular species does it is
              not fully known.
            </p>
          </div>
        </div>
        <p className="callout">
          <strong>Dynamic wetting example: electrowetting.</strong> An electric field interferes with Young’s equation
          and forces a liquid film onto Teflon; when the field is removed, the film dewets again.
        </p>
        <p className="prose">
          <strong>Explore more:</strong>{' '}
          <a className="ext-link" href="https://dropwyse.netlify.app" target="_blank" rel="noopener noreferrer">
            δropwγse
          </a>
          , the lecture’s app, has six modes: Young, hysteresis, Wenzel, Cassie–Baxter with stability, re-entrant
          structures with stability, and liquid-infused layers.
        </p>
      </section>

      <section className="section" aria-labelledby="why-title">
        <h2 id="why-title" className="section-title">
          Why it matters for clean energy
        </h2>
        <ul className="why-list">
          <li>
            <strong>Dirty solar panels.</strong> Dust lowers PV output, and cleaning panels in deserts uses a lot of
            water. Self-cleaning (lotus-type) coatings hold drops in the Cassie–Baxter state, above 150° with
            hysteresis below 5°: rain or dew rolls off and takes the dust with it.
          </li>
          <li>
            <strong>Water transport on patterned surfaces.</strong> Hydrophilic/hydrophobic patterns and contact-angle
            gradients move drops without pumps, e.g. for fog and dew harvesting.
          </li>
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
        </ul>
      </section>
    </article>
  )
}
