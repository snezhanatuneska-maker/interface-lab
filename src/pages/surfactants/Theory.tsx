// Theory sections of the surfactant page: classes, why micelles form, properties around the CMC,
// what moves the CMC, and how surface tension is measured.

const CLASSES = [
  {
    name: 'Anionic',
    head: 'neg',
    example: 'SDS (sodium dodecyl sulfate)',
    text: 'Negative head, Na⁺ counterion. Detergents, toothpaste.',
  },
  {
    name: 'Cationic',
    head: 'pos',
    example: 'CTAB (cetyltrimethylammonium bromide)',
    text: 'Positive head, Br⁻ counterion. Fabric softeners, antiseptics.',
  },
  {
    name: 'Non-ionic',
    head: 'neutral',
    example: 'Tween 20 (polysorbate 20)',
    text: 'Uncharged, bulky polyoxyethylene head. Food, cosmetics.',
  },
  {
    name: 'Zwitterionic',
    head: 'zwit',
    example: 'Betaines (e.g. C12 betaine, cocamidopropyl betaine)',
    text: 'One + and one − charge on the same head, net neutral. Mild shampoos.',
  },
] as const

function MoleculeIcon({ head }: { head: (typeof CLASSES)[number]['head'] }) {
  const sign = head === 'neg' ? '−' : head === 'pos' ? '+' : head === 'zwit' ? '±' : ''
  return (
    <svg viewBox="0 0 120 40" className="class-svg" aria-hidden="true">
      <path className="tail-line" d="M28 20 L36 13 L44 27 L52 13 L60 27 L68 13 L76 27 L84 13 L92 27 L100 13 L108 20" />
      {head === 'zwit' ? (
        <>
          <path className={`head-fill pos`} d="M18 6 A14 14 0 0 0 18 34 Z" />
          <path className={`head-fill neg`} d="M18 6 A14 14 0 0 1 18 34 Z" />
        </>
      ) : (
        <circle cx="18" cy="20" r={head === 'neutral' ? 15 : 13} className={`head-fill ${head}`} />
      )}
      {sign && (
        <text x="18" y="21" className="head-sign">
          {sign}
        </text>
      )}
    </svg>
  )
}

function TensiometerDiagram() {
  return (
    <svg viewBox="0 0 520 220" className="tensio-svg" role="img" aria-label="Wilhelmy plate (left) and Du Noüy ring (right) touching a liquid surface, each pulled down by surface tension while a balance measures the force.">
      {/* ---- Wilhelmy plate ---- */}
      <text x="130" y="20" className="tensio-title">Wilhelmy plate</text>
      <line x1="130" y1="30" x2="130" y2="70" className="tensio-wire" />
      <rect x="95" y="70" width="70" height="80" className="tensio-metal" />
      <rect x="30" y="140" width="200" height="60" className="tensio-liquid" />
      {/* liquid climbing the clean platinum plate */}
      <path d="M30 140 H80 Q93 140 95 124 V140 Z" className="tensio-liquid" />
      <path d="M165 140 V124 Q167 140 180 140 H230 V140 Z" className="tensio-liquid" />
      <path d="M30 140 H80 Q93 140 95 124 M165 124 Q167 140 180 140 H230" className="tensio-surface" />
      <path d="M130 158 V196" className="tensio-arrow" markerEnd="url(#arrow)" />
      <text x="138" y="190" className="tensio-label">F = γ·L</text>
      <text x="130" y="214" className="tensio-note" textAnchor="middle">L = 2 × (width + thickness)</text>

      {/* ---- Du Noüy ring ---- */}
      <text x="390" y="20" className="tensio-title">Du Noüy ring</text>
      <line x1="390" y1="30" x2="390" y2="62" className="tensio-wire" />
      <path d="M390 62 L345 92 M390 62 L435 92" className="tensio-wire" />
      <ellipse cx="390" cy="96" rx="48" ry="9" className="tensio-ring" />
      <rect x="290" y="140" width="200" height="60" className="tensio-liquid" />
      {/* liquid lamella pulled up under the ring */}
      <path d="M290 140 H325 Q338 140 342 98 H438 Q442 140 455 140 H490 V200 H290 Z" className="tensio-liquid" />
      <path d="M290 140 H325 Q338 140 342 98 M438 98 Q442 140 455 140 H490" className="tensio-surface" />
      <path d="M390 120 V196" className="tensio-arrow" markerEnd="url(#arrow)" />
      <text x="398" y="190" className="tensio-label">F<tspan dy="3" fontSize="9">max</tspan><tspan dy="-3"> = 4πRγ·f</tspan></text>
      <text x="390" y="214" className="tensio-note" textAnchor="middle">R = ring radius, f = correction factor</text>

      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0 0 L10 5 L0 10 Z" className="tensio-arrowhead" />
        </marker>
      </defs>
    </svg>
  )
}

export default function Theory() {
  return (
    <>
      <section className="section" aria-labelledby="what-title">
        <h2 id="what-title" className="section-title">
          What is a surfactant?
        </h2>
        <p className="prose">
          A <strong>surf</strong>ace <strong>act</strong>ive <strong>ant</strong> is a molecule with two ends that want
          different things: a <strong>hydrophilic head</strong> that likes water and a <strong>hydrophobic tail</strong>{' '}
          (a hydrocarbon chain, usually 8–18 carbons) that does not. Surfactants are classified by the charge of the
          head.
        </p>
        <ul className="type-grid">
          {CLASSES.map((k) => (
            <li key={k.name} className="card type-card">
              <MoleculeIcon head={k.head} />
              <h3>{k.name}</h3>
              <p>
                <strong>{k.example}.</strong> {k.text}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="section" aria-labelledby="why-micelles-title">
        <h2 id="why-micelles-title" className="section-title">
          Why micelles form
        </h2>
        <p className="prose">
          A hydrocarbon tail in water forces the water molecules around it into an ordered cage. That costs entropy,
          so the system's free energy goes down whenever tails get out of the water. There are two ways out:
        </p>
        <ol className="prose steps">
          <li>
            <strong>Go to the surface.</strong> At low concentration the molecules adsorb at the air–water interface,
            heads in the water, tails in the air. Each one replaces some high-energy water surface, so the surface
            tension γ falls.
          </li>
          <li>
            <strong>Hide in a micelle.</strong> Above the CMC, extra molecules cluster in the bulk: tails together in
            an oily core, heads outside facing the water. The surface is nearly saturated well before this, but it is
            the monomer concentration in the bulk, not a full surface, that sets when micelles form.
          </li>
        </ol>
        <p className="callout">
          The <strong>critical micelle concentration (CMC)</strong> is the concentration at which micelles start to
          form. Above it the free monomer concentration stays (almost) at the CMC; everything added goes into
          micelles. That is why so many properties change slope or level off at the CMC.
        </p>
      </section>

      <section className="section" aria-labelledby="props-title">
        <h2 id="props-title" className="section-title">
          Properties around the CMC
        </h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Property</th>
                <th scope="col">Below the CMC</th>
                <th scope="col">Above the CMC</th>
                <th scope="col">Why</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Surface tension γ</th>
                <td>decreases</td>
                <td>constant (plateau)</td>
                <td>the surface is full and the monomer concentration stops rising</td>
              </tr>
              <tr>
                <th scope="row">Osmotic pressure Π</th>
                <td>increases</td>
                <td>almost constant (still rising for ionic surfactants)</td>
                <td>
                  a micelle of ~60 molecules counts as one particle; for ionic surfactants the unbound counter-ions
                  (about 1 − β of them) still add
                </td>
              </tr>
              <tr>
                <th scope="row">Conductivity κ (ionic only)</th>
                <td>increases linearly</td>
                <td>increases, smaller slope</td>
                <td>micelles bind part of their counterions and move slowly</td>
              </tr>
              <tr>
                <th scope="row">Turbidity τ</th>
                <td>≈ 0</td>
                <td>increases</td>
                <td>micelles are big enough to scatter light</td>
              </tr>
              <tr>
                <th scope="row">Self-diffusion D</th>
                <td>constant (monomer value)</td>
                <td>decreases</td>
                <td>more and more molecules sit in slow micelles</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="section" aria-labelledby="effects-title">
        <h2 id="effects-title" className="section-title">
          What moves the CMC
        </h2>
        <ul className="why-list prose">
          <li>
            <strong>Longer tail → lower CMC.</strong> Each extra CH₂ makes it more favourable to leave the water. For
            ionic surfactants one CH₂ roughly halves the CMC; for non-ionics it divides it by about 3 (Klevens).
          </li>
          <li>
            <strong>Charged head → higher CMC.</strong> In a micelle the ionic heads are pushed close together and
            repel each other, which works against micellisation. Non-ionic heads have no such penalty, so at the same
            tail length their CMC is one to two orders of magnitude lower.
          </li>
          <li>
            <strong>Salt → lower CMC (ionic only).</strong> Added counter-ions (Na⁺ for SDS, Cl⁻ for CTAB) crowd around the
            charged heads and screen their repulsion, so micelles form more easily (Corrin–Harkins). Non-ionic CMCs barely change.
          </li>
        </ul>
      </section>

      <section className="section" aria-labelledby="measure-title">
        <h2 id="measure-title" className="section-title">
          Measuring surface tension
        </h2>
        <p className="prose">
          The CMC is usually found by measuring γ at many concentrations and finding where the curve stops falling.
          Both standard methods hang a clean platinum probe from a sensitive balance and measure how hard the surface
          pulls on it. Platinum is used because the liquid clings fully to it and it is easy to clean by flaming.
        </p>
        <figure className="figure tensio-figure">
          <TensiometerDiagram />
          <figcaption>
            <span className="figure-label">Figure 3.</span> <strong>Wilhelmy plate:</strong> a thin plate just touches
            the surface; the liquid pulls it down along its perimeter L, and the balance reads F = γL directly, at
            equilibrium. <strong>Du Noüy ring:</strong> a ring is pulled up through the surface and the
            maximum force before the liquid film breaks gives γ, after a correction factor f for the shape of the
            lifted liquid.
          </figcaption>
        </figure>
      </section>
    </>
  )
}
