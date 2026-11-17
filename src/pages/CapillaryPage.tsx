import { useState } from 'react'
import { Slider } from '../components/Controls'
import { capillaryPressure, gammaWater, jurinHeight, KELVIN_0, poreKelvinRatio } from '../lib/capillary'
import PoreView from './capillary/PoreView'
import Equations from './capillary/Equations'

const RC_RANGE: [number, number] = [2, 50] // nm
const DELTA_RANGE: [number, number] = [0, 150]
const T_RANGE: [number, number] = [-10, 100] // °C
const DEFAULTS = { rc: 15, delta: 21, tC: 25 }

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
  const [rc, setRc] = useState(DEFAULTS.rc)
  const [delta, setDelta] = useState(DEFAULTS.delta)
  const [tC, setTC] = useState(DEFAULTS.tC)

  const T = tC + KELVIN_0
  const gamma = gammaWater(T)
  const pcMPa = capillaryPressure(gamma, delta, rc * 1e-9) / 1e6
  const hc = fmtHeight(jurinHeight(gamma, delta, rc * 1e-9))
  const kelvin = poreKelvinRatio(gamma, rc * 1e-9, delta, T)

  const reset = () => {
    setRc(DEFAULTS.rc)
    setDelta(DEFAULTS.delta)
    setTC(DEFAULTS.tC)
  }

  return (
    <article className="page">
      <header className="page-intro compact">
        <a className="back-link" href="#/">
          ← All tools
        </a>
        <h1>Capillary Pressure &amp; Pore Filling</h1>
        <p className="lede">
          Explore how pore radius, contact angle and temperature control capillary pressure, capillary rise and
          vapour condensation in a pore.
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
            <span className="coverage-value capillary">{pcMPa.toFixed(2)} MPa</span>
            <span className="coverage-sub">
              water, γ(T) = {(gamma * 1e3).toFixed(1)} mN/m at {tC} °C
            </span>
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
          <PoreView rc={rc} delta={delta} label={`Pore of radius r_c ${rc} nm, contact angle δ ${delta}°.`} />
          <div>
            <dl className="results" aria-live="polite">
              <div>
                <dt>
                  Capillary pressure p<sub>c</sub>
                </dt>
                <dd>{pcMPa.toFixed(2)} MPa</dd>
              </div>
              <div>
                <dt>
                  Capillary rise height h<sub>c</sub> (Jurin)
                </dt>
                <dd>{hc}</dd>
              </div>
              <div>
                <dt>
                  Kelvin: pore fills at p/p<sub>0</sub>
                </dt>
                <dd>{kelvin.toFixed(3)}</dd>
              </div>
            </dl>
            <p className="note">
              γ(T) = 121.5 mN/m − 0.1662 mN m⁻¹ K⁻¹ × T, V<sub>m</sub> = 18 cm³/mol. The Jurin height is the formal
              value h<sub>c</sub> = p<sub>c</sub>/(ρ<sub>L</sub>g): in a nanopore it only expresses the suction as a
              water column. The Kelvin value uses a hemispherical meniscus of signed radius r = −r<sub>c</sub>/cos δ;
              it is only approximate in pores of a few nm.
              {delta > 90 && ' With δ > 90° the meniscus is convex (r > 0): p_c is negative and no capillary condensation occurs below saturation.'}
            </p>
          </div>
        </div>

        <div className="figure-controls hero-controls">
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
          />
          <Slider
            id="temp"
            label={<>Temperature <em>T</em></>}
            value={`${tC} °C`}
            min={T_RANGE[0]}
            max={T_RANGE[1]}
            step={1}
            pos={tC}
            onChange={setTC}
          />
          <div className="sim-buttons">
            <button type="button" className="button" onClick={reset}>
              Reset
            </button>
          </div>
        </div>
        <figcaption>
          <span className="figure-label">Figure 1.</span> Left: the pore, with its walls, the liquid and the meniscus.
          Right: capillary pressure p<sub>c</sub>, capillary rise height h<sub>c</sub> and the relative pressure p/p
          <sub>0</sub> at which the pore fills by capillary condensation, for the current setting.
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
        <h3>Contact-angle hysteresis</h3>
        <p className="prose">
          A liquid advancing into a pore meets the wall at the advancing angle δ<sub>a</sub>; when it recedes, at the
          smaller receding angle δ<sub>r</sub>. Filling and emptying therefore need different capillary pressures. Set
          δ to δ<sub>a</sub> or δ<sub>r</sub> to compare.
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
