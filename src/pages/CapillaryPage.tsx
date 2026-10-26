import { useState } from 'react'
import { Segmented, Slider } from '../components/Controls'
import {
  capillaryPressure,
  jurinHeight,
  kelvinRatio,
  MODE_DEFAULT,
  R_DEFAULT,
  R_RANGE,
  THETA_DEFAULT,
  THETA_RANGE,
  type Mode,
} from '../lib/capillary'
import PoreView from './capillary/PoreView'
import Equations from './capillary/Equations'

const LEGEND = [
  { color: 'var(--pore-liquid)', label: 'liquid' },
  { color: 'var(--solid)', label: 'pore wall' },
  { color: 'var(--data-plot-bg)', label: 'vapor' },
]

/** Height with a readable unit (µm to km); negative = capillary depression. */
function fmtHeight(m: number): string {
  const a = Math.abs(m)
  const [v, unit] = a >= 1000 ? [m / 1000, 'km'] : a >= 1 ? [m, 'm'] : a >= 1e-3 ? [m * 1e3, 'mm'] : [m * 1e6, 'µm']
  return `${Number(v.toPrecision(3)).toLocaleString('en')} ${unit}`
}

export default function CapillaryPage() {
  const [r, setR] = useState(R_DEFAULT)
  const [theta, setTheta] = useState(THETA_DEFAULT)
  const [mode, setMode] = useState<Mode>(MODE_DEFAULT)

  const pc = capillaryPressure(r, theta).toFixed(1)
  const h = fmtHeight(jurinHeight(r, theta))
  const kelvin = kelvinRatio(r, theta).toFixed(3)

  const reset = () => {
    setR(R_DEFAULT)
    setTheta(THETA_DEFAULT)
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
          Explore how pore radius controls capillary pressure, fluid rise, vapor condensation, and contact angle
          hysteresis.
        </p>
      </header>

      {/* ---------- Hero: pore simulator ---------- */}
      <figure id="sim-figure" className="figure hero" aria-label="Interactive pore simulator">
        <div className="hero-head">
          <div className="coverage">
            <span className="coverage-label">
              Capillary pressure <em>P</em>
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
            r={r}
            theta={theta}
            mode={mode}
            label={`Pore of radius ${r} nm, contact angle ${theta}°, ${mode}.`}
          />
          <div>
          <dl className="results" aria-live="polite">
            <div>
              <dt>
                Capillary pressure (P<sub>c</sub>)
              </dt>
              <dd>{pc} kPa</dd>
            </div>
            <div>
              <dt>
                Jurin rise height (<em>h</em>)
              </dt>
              <dd>{h}</dd>
            </div>
            <div>
              <dt>
                Kelvin saturation (P/P<sub>0</sub>)
              </dt>
              <dd>{kelvin}</dd>
            </div>
          </dl>
          <p className="note">
            Water at 25 °C. The Jurin height is the formal value 2γ cos θ/(ρgr): in nanopores it is far beyond any real
            column, because water cavitates long before such suction is reached.
            {theta > 90 && ' With θ > 90° the pressure is negative: the liquid has to be pushed in, and no capillary condensation occurs below saturation.'}
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
            id="r"
            label={<>Pore radius <em>r</em></>}
            value={`${r} nm`}
            min={R_RANGE[0]}
            max={R_RANGE[1]}
            step={1}
            pos={r}
            onChange={setR}
          />
          <Slider
            id="theta"
            label={<>Contact angle <em>θ</em></>}
            value={`${theta}°`}
            min={THETA_RANGE[0]}
            max={THETA_RANGE[1]}
            step={1}
            pos={theta}
            onChange={setTheta}
            hint={mode === 'imbibition' ? 'filling: use the advancing angle θ_A' : 'emptying: use the receding angle θ_R (< θ_A)'}
          />
          <div className="sim-buttons">
            <button type="button" className="button" onClick={reset}>
              Reset
            </button>
          </div>
        </div>
        <figcaption>
          <span className="figure-label">Figure 1.</span> Left: the pore, with its walls, the liquid and the meniscus.
          Right: capillary pressure, Jurin rise height and Kelvin saturation for the current setting.
        </figcaption>
      </figure>

      <section className="section" aria-labelledby="theory-title">
        <h2 id="theory-title" className="section-title">
          Capillary rise, condensation &amp; hysteresis
        </h2>
        <h3>Jurin’s law &amp; height</h3>
        <p className="prose">
          When a wetting liquid (θ &lt; 90°) touches a narrow capillary, the curved meniscus pulls the liquid upward until
          the hydrostatic pressure ρgh balances the capillary pressure. The height (<em>h</em>) is inversely proportional
          to the radius (<em>r</em>): about 1.5 cm in a 1 mm tube, 15 m in a 1 µm pore. A non-wetting liquid (θ &gt;
          90°) is pushed down instead.
        </p>
        <h3>Capillary condensation</h3>
        <p className="prose">
          In mesopores, vapor condenses into liquid at relative pressures below saturation (P/P<sub>0</sub> &lt; 1),
          because the vapor pressure over a concave meniscus is lower than over a flat surface (Kelvin equation). The
          smaller the pore, the lower the pressure at which it fills.
        </p>
        <h3>Two kinds of hysteresis</h3>
        <p className="prose">
          <strong>Imbibition and drainage.</strong> A liquid advancing into a pore meets the wall at the advancing
          angle θ<sub>A</sub>; when it recedes, at the smaller receding angle θ<sub>R</sub>. Filling and emptying
          therefore need different capillary pressures. Use the mode switch and set θ to θ<sub>A</sub> or θ<sub>R</sub>.
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
          are therefore treated with PTFE so that θ &gt; 90°: P<sub>c</sub> turns negative and water only enters the
          largest pores when pushed, leaving the rest open for gas. In a PEM water electrolyser the situation is the
          reverse: water is the reactant and must wick to the anode, so its titanium transport layer is kept
          hydrophilic, and the gas bubbles it produces have to escape through it.
        </p>
      </section>
    </article>
  )
}
