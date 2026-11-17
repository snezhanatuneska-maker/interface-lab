import { useState } from 'react'
import { Segmented, Slider } from '../components/Controls'
import {
  capillaryPressure,
  jurinHeight,
  kelvinRatio,
  DELTA_DEFAULT,
  DELTA_RANGE,
  MODE_DEFAULT,
  RC_DEFAULT,
  RC_RANGE,
  type Mode,
} from '../lib/capillary'
import PoreView from './capillary/PoreView'
import Equations from './capillary/Equations'

const LEGEND = [
  { color: 'var(--pore-liquid)', label: 'liquid' },
  { color: 'var(--solid)', label: 'pore wall' },
  { color: 'var(--data-plot-bg)', label: 'gas / vapour' },
]

/** Height with a readable unit (µm to km); negative = capillary depression. */
function fmtHeight(m: number): string {
  const a = Math.abs(m)
  const [v, unit] = a >= 1000 ? [m / 1000, 'km'] : a >= 1 ? [m, 'm'] : a >= 1e-3 ? [m * 1e3, 'mm'] : [m * 1e6, 'µm']
  return `${Number(v.toPrecision(3)).toLocaleString('en')} ${unit}`
}

export default function CapillaryPage() {
  const [rc, setRc] = useState(RC_DEFAULT)
  const [delta, setDelta] = useState(DELTA_DEFAULT)
  const [mode, setMode] = useState<Mode>(MODE_DEFAULT)

  const pc = capillaryPressure(rc, delta).toFixed(1)
  const hc = fmtHeight(jurinHeight(rc, delta))
  const kelvin = kelvinRatio(rc, delta, mode).toFixed(3)

  const reset = () => {
    setRc(RC_DEFAULT)
    setDelta(DELTA_DEFAULT)
    setMode(MODE_DEFAULT)
  }

  return (
    <article className="page">
      <header className="page-intro compact">
        <a className="back-link" href="#/">
          ← All tools
        </a>
        <h1>Capillary Pressure &amp; Pore Filling</h1>
        <p className="lede">
          Explore how pore radius and contact angle control capillary pressure, fluid rise and vapour condensation, and
          why filling and emptying differ (hysteresis).
        </p>
      </header>

      {/* ---------- Hero: pore simulator ---------- */}
      <figure id="sim-figure" className="figure hero" aria-label="Interactive pore simulator">
        <div className="hero-head">
          <div className="coverage">
            <span className="coverage-label">
              Capillary pressure <em>p</em>
              <sub>c</sub>
            </span>
            <span className="coverage-value capillary">{pc} kPa</span>
            <span className="coverage-sub">{mode === 'imbibition' ? 'imbibition (filling)' : 'drainage (emptying)'}</span>
          </div>
          <ul className="layer-legend" aria-label="Legend">
            {LEGEND.map((l) => (
              <li key={l.label}>
                <span className="dot" style={{ background: l.color }} /> {l.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="sim-grid">
          <PoreView
            rc={rc}
            delta={delta}
            mode={mode}
            label={`Pore of radius r_c ${rc} nm, contact angle δ ${delta}°, ${mode}.`}
          />
          <div>
          <dl className="results" aria-live="polite">
            <div>
              <dt>
                Capillary pressure p<sub>c</sub>
              </dt>
              <dd>{pc} kPa</dd>
            </div>
            <div>
              <dt>
                Capillary rise height h<sub>c</sub> (Jurin)
              </dt>
              <dd>{hc}</dd>
            </div>
            <div>
              <dt>
                Kelvin ratio p/p<sub>0</sub>, {mode === 'imbibition' ? 'filling' : 'emptying'}
              </dt>
              <dd>{kelvin}</dd>
            </div>
          </dl>
          <p className="note">
            Water at 25 °C. The Jurin height is the formal value h<sub>c</sub> = 2γ<sub>lg</sub> cos δ/(ρ<sub>L</sub>gr<sub>c</sub>): in a nanopore it only expresses the
            suction as a water column; gravity plays no role at this scale, and no real pore is that long. Filling uses
            a cylindrical meniscus (factor 1 in the Kelvin equation), emptying a hemispherical one (factor 2), so a pore
            empties at a lower p/p<sub>0</sub> than it fills. The Kelvin value neglects the adsorbed film and is only
            approximate for the narrowest pores (a few nm).
            {delta > 90 && ' With δ > 90° the pressure is negative: the liquid has to be pushed in, and no capillary condensation occurs below saturation.'}
          </p>
          </div>
        </div>

        <div className="figure-controls hero-controls">
          <div className="model-control">
            <span className="control-label">Process mode</span>
            <Segmented
              label="Process mode"
              value={mode}
              onChange={setMode}
              options={[
                { value: 'imbibition', label: 'Imbibition' },
                { value: 'drainage', label: 'Drainage' },
              ]}
            />
          </div>
          <Slider
            id="rc"
            label={<>Capillary radius <em>r</em><sub>c</sub></>}
            value={`${rc} nm`}
            min={RC_RANGE[0]}
            max={RC_RANGE[1]}
            step={1}
            pos={rc}
            onChange={setRc}
          />
          <Slider
            id="delta"
            label={<>Contact angle <em>δ</em></>}
            value={`${delta}°`}
            min={DELTA_RANGE[0]}
            max={DELTA_RANGE[1]}
            step={1}
            pos={delta}
            onChange={setDelta}
            hint={mode === 'imbibition' ? 'filling: use the advancing angle δₐ' : 'emptying: use the receding angle δᵣ (< δₐ)'}
          />
          <div className="sim-buttons">
            <button type="button" className="button" onClick={reset}>
              Reset
            </button>
          </div>
        </div>
        <figcaption>
          <span className="figure-label">Figure 1.</span> Left: the pore, with its walls, the liquid and the meniscus.
          Right: capillary pressure p<sub>c</sub>, capillary rise height h<sub>c</sub> and Kelvin ratio p/p<sub>0</sub> for the current setting.
        </figcaption>
      </figure>

      <section className="section" aria-labelledby="theory-title">
        <h2 id="theory-title" className="section-title">
          Capillary rise, condensation &amp; hysteresis
        </h2>
        <h3>Jurin’s law &amp; height</h3>
        <p className="prose">
          When a wetting liquid (δ &lt; 90°) touches a narrow capillary, the curved meniscus pulls the liquid upward
          until the hydrostatic pressure ρ<sub>L</sub>gh<sub>c</sub> balances the capillary pressure. The height h
          <sub>c</sub> is inversely proportional to the capillary radius r<sub>c</sub>: about 1.5 cm in a tube of 1 mm
          radius, 15 m in a pore of 1 µm radius. A non-wetting liquid (δ &gt; 90°) is pushed down instead.
        </p>
        <h3>Capillary condensation</h3>
        <p className="prose">
          In mesopores, vapour condenses into liquid at relative pressures below saturation (p/p<sub>0</sub> &lt; 1),
          because the vapour pressure over a concave meniscus is lower than over a flat surface (Kelvin equation). The
          smaller the pore, the lower the pressure at which it fills.
        </p>
        <h3>Two kinds of hysteresis</h3>
        <p className="prose">
          <strong>Imbibition and drainage.</strong> A liquid advancing into a pore meets the wall at the advancing
          angle δ<sub>a</sub>; when it recedes, at the smaller receding angle δ<sub>r</sub>. Filling and emptying
          therefore need different capillary pressures. Use the mode switch and set δ to δ<sub>a</sub> or δ<sub>r</sub>.
        </p>
        <p className="prose">
          <strong>Sorption hysteresis.</strong> In capillary condensation the loop has other causes: a pore fills
          through a cylindrical meniscus but empties through a hemispherical one (so at a lower p/p₀), condensation is
          delayed by metastable films, and wide cavities behind narrow necks (ink bottles) only empty when the neck does.
        </p>
      </section>

      <Equations />

      <section className="section" aria-labelledby="why-title">
        <h2 id="why-title" className="section-title">
          Clean energy link: porous electrodes &amp; catalyst layers
        </h2>
        <p className="prose">
          In a PEM fuel cell the catalyst layer has pores of about 10–100 nm, while the gas diffusion layer (GDL)
          below it is carbon paper with pores of about 10–100 µm, often with a microporous layer of about 0.1–1 µm in
          between. Product water must leave without filling the pores that bring O<sub>2</sub> to the catalyst. GDLs
          are therefore treated with PTFE so that δ &gt; 90°: p<sub>c</sub> turns negative and water only enters the
          largest pores when pushed, leaving the rest open for gas. In a PEM water electrolyser the situation is the
          reverse: water is the reactant and must wick to the anode, so its titanium transport layer is kept
          hydrophilic, and the gas bubbles it produces have to escape through it.
        </p>
      </section>
    </article>
  )
}
