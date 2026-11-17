// Theory sections of the surfactant page: classes, why micelles form, properties around the CMC and what moves
// the CMC (qualitative, as in the lecture).

const CLASSES = [
  {
    name: 'Anionic',
    head: 'neg',
    example: 'SDS (sodium dodecyl sulfate)',
    text: 'Negatively charged sulfate head, Na⁺ counterion. Detergents, toothpaste.',
  },
  {
    name: 'Cationic',
    head: 'pos',
    example: 'CTAB (cetyltrimethylammonium bromide)',
    text: 'Positively charged ammonium head, Br⁻ counterion. Fabric softeners, antiseptics.',
  },
  {
    name: 'Non-ionic',
    head: 'neutral',
    example: 'Pluronic (PEG-b-PPG-b-PEG)',
    text: 'Uncharged block copolymer: hydrophilic PEG blocks either side of a hydrophobic PPG block.',
  },
  {
    name: 'Zwitterionic',
    head: 'zwit',
    example: 'POPC (palmitoyl-oleoyl phosphatidylcholine)',
    text: 'A phospholipid: one + and one − charge on the head, net neutral, two tails. Cell membranes.',
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

export default function Theory({ part }: { part: 'intro' | 'cmc' }) {
  if (part === 'intro')
    return (
    <>
      <section className="section" aria-labelledby="what-title">
        <h2 id="what-title" className="section-title">
          Surfactants
        </h2>
        <p className="prose">
          A <strong>surf</strong>ace <strong>act</strong>ive <strong>ant</strong> is <strong>amphiphilic</strong>: one
          molecule with a <strong>hydrophilic head</strong> that likes water and a <strong>hydrophobic tail</strong> (a
          hydrocarbon chain) that does not. Surfactants adsorb at the interface, head in the water and tail out of it,
          and so lower γ. They are classified by the charge of the head.
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

    </>
    )
  return (
    <>
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
                <td>the free monomer concentration stops rising (the surface is by then nearly saturated)</td>
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

    </>
  )
}
