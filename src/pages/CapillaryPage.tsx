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

export default function CapillaryPage() {
  const [r, setR] = useState(R_DEFAULT)
  const [theta, setTheta] = useState(THETA_DEFAULT)
  const [mode, setMode] = useState<Mode>(MODE_DEFAULT)

  const pc = capillaryPressure(r, theta).toFixed(1)
  const h = jurinHeight(r).toFixed(1)
  const kelvin = kelvinRatio(r).toFixed(2)

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
              <dd>{h} µm</dd>
            </div>
            <div>
              <dt>
                Kelvin saturation (P/P<sub>0</sub>)
              </dt>
              <dd>{kelvin}</dd>
            </div>
          </dl>
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
          When a wetting liquid comes into contact with a narrow capillary, surface tension pulls the fluid upward. The
          height (<em>h</em>) is inversely proportional to pore radius (<em>r</em>), meaning sub-micron pores generate
          enormous suction heights.
        </p>
        <h3>Capillary condensation</h3>
        <p className="prose">
          In mesopores, vapor condenses into liquid at relative pressures (P/P<sub>0</sub> &lt; 1) well below
          saturation due to the negative curvature of the menisci, as described by the Kelvin equation.
        </p>
        <h3>Adsorption hysteresis</h3>
        <p className="prose">
          The filling (imbibition) and emptying (drainage) pathways often follow different curves. This hysteresis loop
          arises from contact angle advancing/receding differences and pore network geometry effects.
        </p>
      </section>

      <Equations />

      <section className="section" aria-labelledby="why-title">
        <h2 id="why-title" className="section-title">
          Clean energy link: porous electrodes &amp; catalyst layers
        </h2>
        <p className="prose">
          In hydrogen fuel cells and water electrolyzers, catalyst layers and gas diffusion layers (GDLs) consist of
          complex nanoscale porous carbon networks. Managing capillary pressure (P<sub>c</sub>) is vital: if capillary
          forces are too high, product water completely floods the pore network, starving the active sites of reactant
          gases (O<sub>2</sub> or H<sub>2</sub>). Balancing pore size distribution optimizes liquid water removal while
          preserving ionic conductivity.
        </p>
      </section>
    </article>
  )
}
