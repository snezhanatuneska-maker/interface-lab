import { Fragment, useState, type ReactNode } from 'react'
import { LogSlider, Segmented, Slider } from '../components/Controls'
import Tex from '../components/Tex'
import PoreNetworkSim, { type NetworkPreset } from '../components/PoreNetworkSim'
import {
  capillaryPressure,
  gammaWater,
  GAMMA_WATER,
  jurinHeight,
  KELVIN_0,
  laplaceShape,
  poreKelvinRatio,
  type Shape,
} from '../lib/capillary'
import PoreView from './capillary/PoreView'
import TubeView from './capillary/TubeView'

// Curved Interfaces & Capillarity (#/capillary), in the order of the lecture: 4.1 Young–Laplace, 4.2 capillary rise
// (Jurin), 4.3 capillary pressure curve (with mercury porosimetry), 4.4 Kelvin.

const µm = 1e-6

/** Pore systems for the capillary pressure curve. Radii in m, subunits 1 mm high. Water, δ = 0. */
export const NETWORK_PRESETS: NetworkPreset[] = [
  {
    id: 'inkpot',
    label: 'Ink-bottle (inkpot) pore',
    net: { columns: [[0.5 * µm, 2 * µm, 2 * µm]], height: 1e-3 },
    note: 'A wide body behind a narrow neck: on drainage the body can only empty once the neck does (high Δp); on imbibition it fills at its own, low p_c. The neck decides drainage, the body decides imbibition.',
  },
  {
    id: 'parallel',
    label: 'Three straight capillaries',
    net: { columns: [[0.4 * µm, 0.4 * µm, 0.4 * µm], [0.8 * µm, 0.8 * µm, 0.8 * µm], [1.6 * µm, 1.6 * µm, 1.6 * µm]], height: 1e-3 },
    note: 'Uniform tubes have no ink-bottle effect: each empties and refills at the same Δp, so drainage and imbibition coincide.',
  },
  {
    id: 'network',
    label: 'Mixed network with two interconnections',
    net: {
      columns: [
        [1.6 * µm, 0.4 * µm, 0.8 * µm],
        [0.8 * µm, 0.8 * µm, 0.4 * µm],
        [0.4 * µm, 1.6 * µm, 1.6 * µm],
        [0.8 * µm, 0.4 * µm, 1.6 * µm],
      ],
      height: 1e-3,
      links: [
        [[0, 1], [1, 1]],
        [[2, 2], [3, 2]],
      ],
    },
    note: 'Watch for liquid that loses its path to the membrane: it stays trapped, so S does not reach 0.',
  },
]

const SHAPES: { value: Shape; label: string; tex: string; note: string }[] = [
  { value: 'drop', label: 'Spherical drop', tex: String.raw`\Delta p = \frac{2\gamma}{r}`, note: 'r₁ = r₂ = r' },
  { value: 'bubble', label: 'Soap bubble', tex: String.raw`\Delta p = \frac{4\gamma}{r}`, note: 'two surfaces (inside and outside of the film)' },
  { value: 'cylinder', label: 'Cylinder', tex: String.raw`\Delta p = \frac{\gamma}{r}`, note: 'r₁ = r, r₂ = ∞' },
]

/** Pressure with a readable unit. */
function fmtP(pa: number): string {
  const a = Math.abs(pa)
  if (a >= 1e6) return `${(pa / 1e6).toPrecision(3)} MPa`
  if (a >= 1e3) return `${(pa / 1e3).toPrecision(3)} kPa`
  return `${pa.toPrecision(3)} Pa`
}

/** Length with a readable unit (µm to km); negative = capillary depression. */
function fmtLength(m: number): string {
  const a = Math.abs(m)
  const [v, unit] = a >= 1000 ? [m / 1000, 'km'] : a >= 1 ? [m, 'm'] : a >= 1e-3 ? [m * 1e3, 'mm'] : [m * 1e6, 'µm']
  return `${Number(v.toPrecision(3)).toLocaleString('en')} ${unit}`
}

function Eq({ tex, n }: { tex: string; n: number }) {
  return (
    <div className="formula">
      <div className="formula-body eq-math">
        <Tex display tex={tex} />
      </div>
      <span className="formula-number">({n})</span>
    </div>
  )
}

function Terms({ items }: { items: [string, ReactNode][] }) {
  return (
    <dl className="terms">
      {items.map(([t, d]) => (
        <Fragment key={t}>
          <dt>
            <Tex tex={t} />
          </dt>
          <dd>{d}</dd>
        </Fragment>
      ))}
    </dl>
  )
}

// ---------- 4.1 Young–Laplace ----------

function LaplaceSection() {
  const [shape, setShape] = useState<Shape>('drop')
  const [rMm, setRMm] = useState(1)
  const [gammaMN, setGammaMN] = useState(72)
  const s = SHAPES.find((x) => x.value === shape)!
  const dp = laplaceShape(shape, gammaMN / 1e3, rMm * 1e-3)
  return (
    <section className="section" aria-labelledby="yl-title">
      <h2 id="yl-title" className="section-title">
        4.1 Young–Laplace: pressure across a curved interface
      </h2>
      <p className="prose">
        A curved interface carries a pressure difference: the pressure on the concave side (inside a drop or bubble)
        is higher. It depends on the two principal radii of curvature r<sub>1</sub>, r<sub>2</sub>, i.e. on the mean
        curvature of the surface.
      </p>
      <div className="eq-grid">
        <div className="card eq-card">
          <h3>Young–Laplace equation</h3>
          <Eq n={1} tex={String.raw`\Delta p = \gamma\left(\frac{1}{r_1} + \frac{1}{r_2}\right)`} />
          <Terms
            items={[
              [String.raw`\Delta p`, 'pressure difference across the interface (inside − outside)'],
              [String.raw`\gamma`, 'surface tension of the interface'],
              [String.raw`r_1, r_2`, 'principal radii of curvature'],
            ]}
          />
          <p className="note">Spherical drop 2γ/r; soap bubble 4γ/r (two surfaces); cylinder γ/r.</p>
        </div>
        <figure className="card figure-card" aria-label="Young–Laplace calculator">
          <h3>Try it</h3>
          <Segmented label="Shape" value={shape} onChange={setShape} options={SHAPES.map((x) => ({ value: x.value, label: x.label }))} />
          <div className="formula-body eq-math">
            <Tex display tex={s.tex} />
          </div>
          <p className="note">{s.note}</p>
          <LogSlider id="yl-r" label={<>Radius <em>r</em> (mm)</>} range={[0.001, 10]} value={rMm} onChange={setRMm} />
          <Slider id="yl-g" label={<>Surface tension <em>γ</em></>} value={`${gammaMN} mN/m`} min={15} max={80} step={1} pos={gammaMN} onChange={setGammaMN} />
          <p className="big-readout" aria-live="polite">
            Δp = <strong>{fmtP(dp)}</strong>
          </p>
        </figure>
      </div>
    </section>
  )
}

// ---------- 4.2 Capillary rise ----------

function JurinSection() {
  const [rcMm, setRcMm] = useState(0.5)
  const [delta, setDelta] = useState(20)
  const rc = rcMm * 1e-3
  const pc = capillaryPressure(GAMMA_WATER, delta, rc)
  const hc = jurinHeight(GAMMA_WATER, delta, rc)
  return (
    <section className="section" aria-labelledby="jurin-title">
      <h2 id="jurin-title" className="section-title">
        4.2 Capillary rise (Jurin)
      </h2>
      <p className="prose">
        In a narrow capillary of radius r<sub>c</sub> the meniscus is curved, so by Young–Laplace there is a capillary
        pressure p<sub>c</sub> across it. A wetting liquid rises until the hydrostatic pressure ρ<sub>L</sub>gh
        <sub>c</sub> balances p<sub>c</sub>.
      </p>
      <div className="eq-grid">
        <div className="card eq-card">
          <h3>Capillary pressure and rise height</h3>
          <Eq n={2} tex={String.raw`p_c = \frac{2\gamma_{lg}\cos\delta}{r_c}`} />
          <Eq n={3} tex={String.raw`h_c = \frac{2\gamma_{lg}\cos\delta}{\rho_L g r_c} = \frac{2\Delta\gamma_s}{\rho_L g r_c}`} />
          <Eq n={4} tex={String.raw`\Delta\gamma_s = \gamma_{sg} - \gamma_{sl}`} />
          <Terms
            items={[
              [String.raw`\gamma_{lg}`, 'surface tension liquid–gas'],
              [String.raw`\delta`, 'contact angle (through liquid)'],
              [String.raw`r_c`, 'capillary radius'],
              [String.raw`\rho_L`, 'liquid density'],
              [String.raw`\Delta\gamma_s`, 'surface-energy change when solid–gas is replaced by solid–liquid interface'],
            ]}
          />
        </div>
        <div className="card">
          <h3>Three consequences</h3>
          <ul className="why-list">
            <li>
              <strong>δ = 0:</strong> hemispherical meniscus, p<sub>c</sub> = 2γ/r<sub>c</sub>.
            </li>
            <li>
              <strong>δ = 90°:</strong> flat meniscus, p<sub>c</sub> = 0, no rise.
            </li>
            <li>
              <strong>δ &gt; 90°:</strong> convex meniscus, p<sub>c</sub> &lt; 0: <strong>capillary depression</strong>{' '}
              (mercury in glass).
            </li>
          </ul>
          <h3>Molecular picture</h3>
          <p>
            Attractive solid–liquid interactions: the liquid rises to replace solid–gas by solid–liquid interface (Δγ
            <sub>s</sub> &gt; 0). Repulsive (weak) solid–liquid interactions: the level drops.
          </p>
        </div>
      </div>

      <figure className="figure" aria-label="Capillary rise in a tube">
        <div className="sim-grid">
          <TubeView hc={hc} delta={delta} label={`Water in a tube of radius ${rcMm} mm, contact angle ${delta}°: h_c = ${fmtLength(hc)}.`} />
          <div>
            <dl className="results" aria-live="polite">
              <div>
                <dt>
                  Capillary pressure p<sub>c</sub>
                </dt>
                <dd>{fmtP(pc)}</dd>
              </div>
              <div>
                <dt>
                  Capillary rise height h<sub>c</sub>
                </dt>
                <dd>{fmtLength(hc)}</dd>
              </div>
            </dl>
            <p className="note">Water: γ<sub>lg</sub> = 72 mN/m, ρ<sub>L</sub> = 1000 kg/m³. The drawn height is compressed.</p>
          </div>
        </div>
        <div className="figure-controls">
          <LogSlider id="jurin-r" label={<>Capillary radius <em>r</em><sub>c</sub> (mm)</>} range={[0.001, 5]} value={rcMm} onChange={setRcMm} />
          <Slider id="jurin-d" label={<>Contact angle <em>δ</em></>} value={`${delta}°`} min={0} max={150} step={1} pos={delta} onChange={setDelta} />
        </div>
        <figcaption>
          <span className="figure-label">Figure 1.</span> A capillary dipped into water. 1 mm radius: about 1.5 cm;
          1 µm: about 15 m.
        </figcaption>
      </figure>
    </section>
  )
}

// ---------- 4.3 Capillary pressure curve ----------

function CurveSection() {
  return (
    <section className="section" aria-labelledby="curve-title">
      <h2 id="curve-title" className="section-title">
        4.3 Capillary pressure curve
      </h2>
      <p className="prose">
        A real pore system has many pore sizes. Its capillary pressure curve plots the saturation S, the fraction of the
        pore volume filled with the wetting liquid, against the applied pressure difference Δp. It can be modelled with
        columns of cylindrical capillaries of different radius: gas pushes at the top (p<sub>0</sub> + Δp), and a
        membrane at the bottom lets only the wetting liquid through.
      </p>
      <div className="formula">
        <div className="formula-body eq-math">
          <Tex display tex={String.raw`S = \frac{V_\text{wetting}}{V_\text{pore}}`} />
        </div>
        <span className="formula-number">(5)</span>
      </div>
      <PoreNetworkSim presets={NETWORK_PRESETS} figure={2} />
      <p className="callout">
        <strong>Gravity.</strong> The model assumes that only p<sub>c</sub> matters. When the capillary rise height h
        <sub>c</sub> of a subunit is comparable to the height of the pore system, gravity can no longer be neglected:
        such a wide pore cannot be held full and drains under its own weight.
      </p>

      <div className="card" id="mercury">
        <h3>Application: mercury intrusion porosimetry</h3>
        <p>
          Mercury is non-wetting for almost all materials (δ ≈ 130–140°), so it has to be pushed in. With increasing
          pressure it enters smaller and smaller pores; Young–Laplace for a cylindrical pore gives the pore diameter
          from the pressure, d = −4γ cos δ/p. The intruded volume against pressure is a capillary pressure curve, and
          from it the pore-size distribution. <a href="#/mips">Mercury Intrusion Porosimetry →</a>
        </p>
      </div>
    </section>
  )
}

// ---------- 4.4 Kelvin ----------

const KELVIN_DEFAULTS = { rc: 15, delta: 0, tC: 25 }

function KelvinSection() {
  const [rc, setRc] = useState(KELVIN_DEFAULTS.rc)
  const [delta, setDelta] = useState(KELVIN_DEFAULTS.delta)
  const [tC, setTC] = useState(KELVIN_DEFAULTS.tC)
  const T = tC + KELVIN_0
  const gamma = gammaWater(T)
  const pc = capillaryPressure(gamma, delta, rc * 1e-9)
  const hc = jurinHeight(gamma, delta, rc * 1e-9)
  const ratio = poreKelvinRatio(gamma, rc * 1e-9, delta, T)
  const reset = () => {
    setRc(KELVIN_DEFAULTS.rc)
    setDelta(KELVIN_DEFAULTS.delta)
    setTC(KELVIN_DEFAULTS.tC)
  }

  return (
    <section className="section" aria-labelledby="kelvin-title">
      <h2 id="kelvin-title" className="section-title">
        4.4 Kelvin equation: vapour pressure over curved surfaces
      </h2>
      <p className="prose">
        The vapour pressure over a curved surface differs from that over a flat one (p<sub>0</sub>). The radius r is
        signed: a convex droplet has r &gt; 0, so p &gt; p<sub>0</sub>; a concave meniscus in a wetting pore has r &lt;
        0, so p &lt; p<sub>0</sub>, and vapour condenses in the pore below saturation (capillary condensation). For a
        pore of radius r<sub>c</sub> with contact angle δ the hemispherical meniscus has r = −r<sub>c</sub>/cos δ.
      </p>
      <div className="eq-grid">
        <div className="card eq-card">
          <h3>Kelvin equation</h3>
          <Eq
            n={6}
            tex={String.raw`\begin{aligned} p &= p_0\exp\left(\frac{2V_m\gamma}{RTr}\right) = p_0\exp\left(\frac{2M\gamma}{RT\rho r}\right) \\ &= p_0\exp\left(\frac{2v_m\gamma}{k_BTr}\right) \end{aligned}`}
          />
          <Terms
            items={[
              ['p, p_0', 'vapour pressure over the curved and the flat surface'],
              ['V_m, M, v_m', 'molar volume, molar mass, molecular volume'],
              [String.raw`\rho`, 'density of the liquid'],
              ['R, k_B, T', 'gas constant, Boltzmann constant, temperature'],
              ['r', 'radius of curvature (signed)'],
            ]}
          />
        </div>
        <div className="card eq-card">
          <h3>General form</h3>
          <Eq n={7} tex={String.raw`p = p_0\exp\left[\frac{V_m\gamma}{RT}\left(\frac{1}{r_1}+\frac{1}{r_2}\right)\right]`} />
          <p className="note">With r₁ = r₂ = r this is the spherical form (6). Kelvin is approximate in pores of only a few nm.</p>
          <h3>Solid/liquid analogue</h3>
          <Eq n={8} tex={String.raw`c = c_0\exp\left(\frac{2V_m\gamma}{RTr}\right)`} />
          <p className="note">The solubility c of a small particle is higher than that of a flat surface, c<sub>0</sub>.</p>
        </div>
      </div>

      <figure id="sim-figure" className="figure" aria-label="Capillary condensation in one pore">
        <div className="hero-head">
          <div className="coverage">
            <span className="coverage-label">
              Pore fills at p/p<sub>0</sub>
            </span>
            <span className="coverage-value capillary">{ratio.toFixed(3)}</span>
            <span className="coverage-sub">
              water, γ(T) = {(gamma * 1e3).toFixed(1)} mN/m at {tC} °C
            </span>
          </div>
        </div>
        <div className="sim-grid">
          <PoreView rc={rc} delta={delta} label={`Pore of radius r_c ${rc} nm, contact angle δ ${delta}°.`} />
          <div>
            <dl className="results" aria-live="polite">
              <div>
                <dt>
                  Kelvin: relative humidity p/p<sub>0</sub> at which the pore fills
                </dt>
                <dd>{ratio.toFixed(3)}</dd>
              </div>
              <div>
                <dt>
                  Capillary pressure p<sub>c</sub>
                </dt>
                <dd>{fmtP(pc)}</dd>
              </div>
              <div>
                <dt>
                  Capillary rise height h<sub>c</sub> (formal)
                </dt>
                <dd>{fmtLength(hc)}</dd>
              </div>
            </dl>
            <p className="note">
              γ(T) = 121.5 mN/m − 0.1662 mN m⁻¹ K⁻¹ × T (T in K), V<sub>m</sub> = 18 cm³/mol, R = 8.3145 J K⁻¹ mol⁻¹.
              Hemispherical meniscus, r = −r<sub>c</sub>/cos δ. Kelvin is approximate in pores of only a few nm.
              {delta > 90 && ' With δ > 90° the meniscus is convex (r > 0): p > p₀, so no capillary condensation below saturation.'}
            </p>
          </div>
        </div>
        <div className="figure-controls hero-controls">
          <Slider id="rc" label={<>Capillary radius <em>r</em><sub>c</sub></>} value={`${rc} nm`} min={1} max={50} step={1} pos={rc} onChange={setRc} />
          <Slider id="delta" label={<>Contact angle <em>δ</em></>} value={`${delta}°`} min={0} max={150} step={1} pos={delta} onChange={setDelta} />
          <Slider id="temp" label={<>Temperature <em>T</em></>} value={`${tC} °C`} min={-10} max={100} step={1} pos={tC} onChange={setTC} />
          <div className="sim-buttons">
            <button type="button" className="button" onClick={reset}>
              Reset
            </button>
          </div>
        </div>
        <figcaption>
          <span className="figure-label">Figure 3.</span> A single pore: the relative pressure (humidity) at which it
          fills by capillary condensation, and its capillary pressure, at the chosen temperature.
        </figcaption>
      </figure>

      <div className="concept-grid">
        <div>
          <h3>Ostwald ripening</h3>
          <p>
            In a population of droplets or particles, the small ones have the higher vapour pressure (or solubility).
            Material moves from small to large: small particles shrink and disappear, large ones grow.
          </p>
        </div>
        <div>
          <h3>Molecular picture</h3>
          <p>
            A molecule at a convex droplet surface has fewer neighbours to bond to than at a planar surface, so it
            escapes more easily (p &gt; p<sub>0</sub>). In a bubble or concave meniscus it has more neighbours, so p &lt;
            p<sub>0</sub>.
          </p>
          <CurvatureSketch />
        </div>
      </div>
    </section>
  )
}

/** Planar vs droplet vs bubble: a central molecule and its nearest neighbours in the liquid. */
function CurvatureSketch() {
  const panels = [
    { title: 'planar', curve: 'M10 60 L110 60', liquidBelow: true },
    { title: 'droplet (convex)', curve: 'M10 80 Q60 20 110 80', liquidBelow: true },
    { title: 'bubble (concave)', curve: 'M10 45 Q60 95 110 45', liquidBelow: true },
  ]
  return (
    <svg viewBox="0 0 360 120" className="curv-svg" role="img" aria-label="A surface molecule has fewest liquid neighbours on a convex droplet and most in a concave bubble.">
      {panels.map((p, i) => (
        <g key={p.title} transform={`translate(${i * 120} 0)`}>
          <path d={`${p.curve} L110 110 L10 110 Z`} className="curv-liquid" />
          <path d={p.curve} className="curv-line" />
          <circle cx={60} cy={i === 0 ? 60 : i === 1 ? 50 : 70} r={6} className="curv-mol" />
          <text x={60} y={14} textAnchor="middle" className="curv-label">
            {p.title}
          </text>
        </g>
      ))}
    </svg>
  )
}

export default function CapillaryPage() {
  return (
    <article className="page">
      <header className="page-intro compact">
        <a className="back-link" href="#/">
          ← All tools
        </a>
        <h1>Curved Interfaces &amp; Capillarity</h1>
        <p className="lede">
          A curved interface carries a pressure difference (Young–Laplace). It drives capillary rise, sets how pore
          systems fill and empty (the capillary pressure curve), and changes the vapour pressure above the surface
          (Kelvin).
        </p>
      </header>

      <LaplaceSection />
      <JurinSection />
      <CurveSection />
      <KelvinSection />

      <section className="section" aria-labelledby="why-title">
        <h2 id="why-title" className="section-title">
          Why it matters for clean energy
        </h2>
        <ul className="why-list">
          <li>
            <strong>Porous electrodes.</strong> In a PEM fuel cell the catalyst layer has pores of about 10–100 nm and
            the gas diffusion layer about 10–100 µm. Product water must leave without filling the pores that bring O
            <sub>2</sub> to the catalyst. PTFE treatment makes δ &gt; 90°, so p<sub>c</sub> &lt; 0 and water only enters
            the largest pores when pushed.
          </li>
          <li>
            <strong>Capillary pressure curves</strong> of electrodes and transport layers tell how much of the pore
            volume is liquid-filled at a given pressure difference, and why drainage and imbibition differ.
          </li>
          <li>
            <strong>Humidity and condensation.</strong> By Kelvin, small hydrophilic pores fill with water below
            saturation, which can block gas transport in catalyst layers (and is the basis of humidity sensors).
          </li>
        </ul>
      </section>
    </article>
  )
}
