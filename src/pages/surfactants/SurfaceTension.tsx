import { useState } from 'react'
import { Segmented, Slider } from '../../components/Controls'
import Tex from '../../components/Tex'
import { duNouyForce, G, SURFACE_TENSIONS, wilhelmyForce } from '../../lib/surfaceTension'

// Lecture sections 1 (Introduction: what is an interface?) and 2 (Surface tension) on #/surfactants.

/** Liquid–gas density profile across the interface, with the Gibbs dividing surface. */
function ProfileSketch() {
  const W = 420
  const H = 200
  const x0 = 50
  const x1 = W - 20
  const yL = 50 // liquid density level
  const yG = 160 // gas density level
  const mid = (x0 + x1) / 2
  const pts = Array.from({ length: 61 }, (_, i) => {
    const x = x0 + ((x1 - x0) * i) / 60
    const y = yL + ((yG - yL) * (1 + Math.tanh((x - mid) / 22))) / 2
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="tensio-svg profile-svg" role="img" aria-label="Density falls smoothly from the liquid value to the gas value over a few molecular diameters; the Gibbs dividing surface is drawn as a sharp step at the middle.">
      <line x1={x0} y1={20} x2={x0} y2={H - 25} className="tensio-wire" />
      <line x1={x0} y1={H - 25} x2={x1} y2={H - 25} className="tensio-wire" />
      <text x={x0 - 8} y={yL + 4} textAnchor="end" className="tensio-note">ρ_liquid</text>
      <text x={x0 - 8} y={yG + 4} textAnchor="end" className="tensio-note">ρ_gas</text>
      <text x={(x0 + x1) / 2} y={H - 6} textAnchor="middle" className="tensio-note">position across the interface (a few molecular diameters)</text>
      <path d={`M${x0} ${yL} H${mid} V${yG} H${x1}`} className="profile-step" />
      <polyline points={pts.join(' ')} className="profile-line" />
      <line x1={mid} y1={22} x2={mid} y2={H - 25} className="profile-gds" />
      <text x={mid + 6} y={32} className="tensio-label">Gibbs dividing surface</text>
      <text x={x0 + 10} y={yL - 8} className="tensio-note">liquid</text>
      <text x={x1 - 10} y={yG - 8} textAnchor="end" className="tensio-note">gas</text>
    </svg>
  )
}

/** Horizontal bar chart of the lecture table, on a log scale (γ spans two decades). */
function TensionChart() {
  const W = 420
  const rowH = 24
  const left = 80
  const right = W - 60
  const H = SURFACE_TENSIONS.length * rowH + 30
  const lo = Math.log10(10)
  const hi = Math.log10(2000)
  const x = (g: number) => left + ((Math.log10(g) - lo) / (hi - lo)) * (right - left)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="bar-svg" role="img" aria-label="Bar chart of the surface tensions in the table, on a log scale: from pentane, 16 mN/m, to platinum, 1800 mN/m.">
      {[10, 100, 1000].map((t) => (
        <g key={t}>
          <line x1={x(t)} x2={x(t)} y1={4} y2={H - 22} className="bar-grid" />
          <text x={x(t)} y={H - 6} textAnchor="middle" className="bar-tick">
            {t}
          </text>
        </g>
      ))}
      {SURFACE_TENSIONS.map((f, i) => (
        <g key={f.fluid}>
          <text x={left - 6} y={i * rowH + 20} textAnchor="end" className="bar-tick">
            {f.fluid}
          </text>
          <rect x={left} y={i * rowH + 8} width={x(f.gamma) - left} height={rowH - 8} className={f.metal ? 'bar-metal' : 'bar-fill'} />
          <text x={x(f.gamma) + 4} y={i * rowH + 20} className="bar-tick">
            {f.gamma}
          </text>
        </g>
      ))}
    </svg>
  )
}

type Method = 'plate' | 'ring'

/** Wilhelmy / Du Noüy calculator. Defaults differ from Exercise 1.1 on purpose. */
function TensiometerCalc() {
  const [method, setMethod] = useState<Method>('plate')
  const [gamma, setGamma] = useState(72) // mN/m
  const [widthMm, setWidthMm] = useState(20)
  const [thickMm, setThickMm] = useState(0.2)
  const [outerMm, setOuterMm] = useState(20)
  const [wireMm, setWireMm] = useState(0.4)

  const g = gamma / 1e3
  const F = method === 'plate' ? wilhelmyForce(g, widthMm / 1e3, thickMm / 1e3) : duNouyForce(g, outerMm / 1e3, (outerMm - 2 * wireMm) / 1e3)
  const dm = (F / G) * 1e3 // g
  const line = method === 'plate' ? 2 * (widthMm + thickMm) : Math.PI * (2 * outerMm - 2 * wireMm)

  return (
    <figure className="figure" aria-label="Tensiometer calculator">
      <div className="sim-grid">
        <TensiometerDiagram method={method} />
        <div>
          <Segmented
            label="Method"
            value={method}
            onChange={setMethod}
            options={[
              { value: 'plate', label: 'Wilhelmy plate' },
              { value: 'ring', label: 'Du Noüy ring' },
            ]}
          />
          <div className="formula-body eq-math">
            <Tex
              display
              tex={
                method === 'plate'
                  ? String.raw`F = \gamma P\cos\delta,\quad P = 2(\text{width}+\text{thickness})`
                  : String.raw`F = \gamma\cdot\pi(d_\text{outer} + d_\text{inner})`
              }
            />
          </div>
          <dl className="results" aria-live="polite">
            <div>
              <dt>{method === 'plate' ? 'Wetted perimeter P' : 'Contact line π(d_outer + d_inner)'}</dt>
              <dd>{line.toFixed(1)} mm</dd>
            </div>
            <div>
              <dt>Force F</dt>
              <dd>{(F * 1e3).toFixed(3)} mN</dd>
            </div>
            <div className="result-main">
              <dt>Extra mass Δm = F/g</dt>
              <dd>{dm.toFixed(3)} g</dd>
            </div>
          </dl>
          <p className="note">
            {method === 'plate'
              ? 'Clean plate: δ = 0, so cos δ = 1.'
              : 'The ring holds liquid along two contact lines, outside and inside the wire: d_inner = d_outer − 2 × wire diameter.'}
          </p>
        </div>
      </div>
      <div className="figure-controls hero-controls">
        <Slider id="t-g" label={<>Surface tension <em>γ</em></>} value={`${gamma} mN/m`} min={15} max={80} step={1} pos={gamma} onChange={setGamma} />
        {method === 'plate' ? (
          <>
            <Slider id="t-w" label="Plate width" value={`${widthMm} mm`} min={5} max={100} step={1} pos={widthMm} onChange={setWidthMm} />
            <Slider id="t-t" label="Plate thickness" value={`${thickMm.toFixed(1)} mm`} min={0.1} max={2} step={0.1} pos={thickMm} onChange={setThickMm} />
          </>
        ) : (
          <>
            <Slider id="t-o" label="Outer ring diameter" value={`${outerMm} mm`} min={5} max={40} step={1} pos={outerMm} onChange={setOuterMm} />
            <Slider id="t-d" label="Wire diameter" value={`${wireMm.toFixed(1)} mm`} min={0.1} max={1} step={0.1} pos={wireMm} onChange={setWireMm} />
          </>
        )}
      </div>
      <figcaption>
        <span className="figure-label">Figure 2.</span> The balance arm is kept horizontal by adding a mass Δm to the
        counterweight pan once the probe touches the liquid; Δm g equals the force the surface pulls with.
      </figcaption>
    </figure>
  )
}

function TensiometerDiagram({ method }: { method: Method }) {
  return (
    <svg viewBox="0 0 260 220" className="tensio-svg" role="img" aria-label={method === 'plate' ? 'Wilhelmy plate touching the liquid, pulled down along its perimeter.' : 'Du Noüy ring in the liquid surface, pulled down along an inner and an outer contact line.'}>
      <line x1="130" y1="10" x2="130" y2="60" className="tensio-wire" />
      {method === 'plate' ? (
        <>
          <rect x="95" y="60" width="70" height="80" className="tensio-metal" />
          <rect x="20" y="140" width="220" height="60" className="tensio-liquid" />
          <path d="M20 140 H80 Q93 140 95 124 V140 Z" className="tensio-liquid" />
          <path d="M165 140 V124 Q167 140 180 140 H240 V140 Z" className="tensio-liquid" />
          <path d="M20 140 H80 Q93 140 95 124 M165 124 Q167 140 180 140 H240" className="tensio-surface" />
          <text x="130" y="214" className="tensio-note" textAnchor="middle">P = 2 × (width + thickness)</text>
        </>
      ) : (
        <>
          <path d="M130 60 L85 92 M130 60 L175 92" className="tensio-wire" />
          <ellipse cx="130" cy="138" rx="48" ry="9" className="tensio-ring" />
          <rect x="20" y="140" width="220" height="60" className="tensio-liquid" />
          <path d="M20 140 H70 Q80 140 82 132 M178 132 Q180 140 190 140 H240 M98 140 Q100 132 104 132 M156 132 Q160 132 162 140" className="tensio-surface" />
          <text x="130" y="214" className="tensio-note" textAnchor="middle">two contact lines: outer + inner</text>
        </>
      )}
      <path d="M130 150 V196" className="tensio-arrow" markerEnd="url(#arrow-t)" />
      <text x="138" y="186" className="tensio-label">F</text>
      <defs>
        <marker id="arrow-t" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0 0 L10 5 L0 10 Z" className="tensio-arrowhead" />
        </marker>
      </defs>
    </svg>
  )
}

export default function SurfaceTension() {
  return (
    <>
      <section className="section" aria-labelledby="interface-title">
        <h2 id="interface-title" className="section-title">
          1 What is an interface?
        </h2>
        <p className="prose">
          An interface is the boundary between two phases. It is only a few molecular diameters thick, but it has a
          higher energy than the bulk. Across a liquid–gas interface the density changes smoothly from the liquid to the
          gas value; for bookkeeping it is replaced by a sharp step at the <strong>Gibbs dividing surface</strong>.
        </p>
        <figure className="figure tensio-figure">
          <ProfileSketch />
          <figcaption>
            <span className="figure-label">Figure 1.</span> Concentration (density) profile across a liquid–gas
            interface (curve) and the idealised step at the Gibbs dividing surface.
          </figcaption>
        </figure>
        <p className="prose">
          The interface is dynamic: molecules constantly exchange with the bulk. For water/air a molecule stays at the
          interface for only about 0.1 µs on average.
        </p>
      </section>

      <section className="section" aria-labelledby="tension-title">
        <h2 id="tension-title" className="section-title">
          2 Surface tension
        </h2>
        <div className="eq-grid">
          <div className="card">
            <h3>Molecular origin</h3>
            <p>
              A molecule in the bulk is surrounded by neighbours on all sides. At the surface its environment is
              anisotropic: neighbours are missing on the gas side. Bringing molecules to the surface, i.e. increasing the
              area, therefore costs work, and an interface minimises its area. That is why free droplets are spherical.
            </p>
            <p>
              γ decreases with increasing temperature and vanishes at the critical point, where liquid and gas become
              the same.
            </p>
          </div>
          <div className="card eq-card">
            <h3>Thermodynamic definition</h3>
            <div className="formula">
              <div className="formula-body eq-math">
                <Tex display tex={String.raw`\gamma = \left(\frac{\partial F}{\partial A}\right)_{T,V,N}`} />
              </div>
              <span className="formula-number">(1)</span>
            </div>
            <p className="note">
              F: Helmholtz free energy; A: interfacial area. Units J/m² = N/m: an energy per area, or equally a force
              per length.
            </p>
          </div>
        </div>

        <h3 className="sub-title">Surface tensions of some fluids</h3>
        <p className="prose">γ scales with the strength of the intermolecular forces, as the boiling points show too.</p>
        <div className="table-chart">
          <div className="table-wrap">
            <table className="data-table numeric-table">
              <thead>
                <tr>
                  <th scope="col">Fluid</th>
                  <th scope="col">T / °C</th>
                  <th scope="col">γ / mN m⁻¹</th>
                  <th scope="col">Boiling point / °C</th>
                </tr>
              </thead>
              <tbody>
                {SURFACE_TENSIONS.map((f) => (
                  <tr key={f.fluid}>
                    <th scope="row">{f.fluid}</th>
                    <td>{f.T}</td>
                    <td>{f.gamma}</td>
                    <td>{f.boil}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <TensionChart />
        </div>

        <h3 className="sub-title">Measuring surface tension</h3>
        <div className="concept-grid">
          <div>
            <h3>Wilhelmy plate</h3>
            <p>
              A thin plate touches the liquid; the surface pulls it down along its wetted perimeter P = 2(width +
              thickness): F = γ P cos δ, with δ = 0 for a clean plate.
            </p>
          </div>
          <div>
            <h3>Du Noüy ring</h3>
            <p>
              A wire ring in the surface is held by two contact lines, outside and inside the wire: F = γ π(d
              <sub>outer</sub> + d<sub>inner</sub>).
            </p>
          </div>
          <div>
            <h3>Pendant drop</h3>
            <p>
              The shape of a drop hanging from a needle is set by the balance between surface tension (Young–Laplace
              pressure, which keeps it round) and gravity (which stretches it). Fitting the shape gives γ.
            </p>
          </div>
        </div>
        <TensiometerCalc />
      </section>
    </>
  )
}
