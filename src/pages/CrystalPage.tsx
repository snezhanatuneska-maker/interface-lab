import { useRef, useState, type KeyboardEvent } from 'react'
import { LogSlider, Segmented, Slider } from '../components/Controls'
import { useThemeColors } from '../lib/themeColors'
import {
  CAP_FACTOR,
  effectiveRatio,
  GAMMA_RATIO_DEFAULT,
  GAMMA_RATIO_RANGE,
  RATIO_DEFAULT,
  RATIO_RANGE,
  stickProbability,
  survivingFamilies,
  S_DEFAULT,
  S_RANGE,
  type Family,
} from '../lib/crystal'
import FacetView, { type FacetStats } from './crystal/FacetView'
import DlaView, { type DlaStats } from './crystal/DlaView'
import RegimePlot from './crystal/RegimePlot'
import Equations from './crystal/Equations'

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

type TabId = 'facet' | 'diffusion'
const TABS: { id: TabId; label: string }[] = [
  { id: 'facet', label: 'Facet growth (surface-reaction control)' },
  { id: 'diffusion', label: 'Diffusion-limited growth' },
]

const FAMILY = { '10': '{10}', '11': '{11}' } as const
const SHAPE_NAME = { square: 'Square', diamond: 'Diamond', octagon: 'Octagon' } as const
const EMPTY_FACET: FacetStats = { len10: 0, len11: 0, name: 'octagon', area: 0, size: 0, done: false }
const EMPTY_DLA: DlaStats = { count: 1, compactness: 1, done: false }

const dlaShape = (c: number) => (c > 0.55 ? 'Compact' : c > 0.33 ? 'Rough' : 'Branched (dendritic)')

function habitText(ratio: number): string {
  const s = survivingFamilies(ratio)
  if (s.length === 2) return 'both families survive: an octagon'
  return s[0] === '10' ? 'the {11} faces grow out: a square' : 'the {10} faces grow out: a diamond'
}

export default function CrystalPage() {
  const theme = useThemeColors()
  const [tab, setTab] = useState<TabId>('facet')
  const tabRefs = useRef<Record<TabId, HTMLButtonElement | null>>({ facet: null, diffusion: null })

  // Tab 1
  const [ratio, setRatio] = useState(RATIO_DEFAULT)
  const [capOn, setCapOn] = useState(false)
  const [capFamily, setCapFamily] = useState<Family>('11')
  const [showWulff, setShowWulff] = useState(false)
  const [gammaRatio, setGammaRatio] = useState(GAMMA_RATIO_DEFAULT)
  const [facetRun, setFacetRun] = useState(0)
  const [facetPaused, setFacetPaused] = useState(prefersReducedMotion)
  const [facet, setFacet] = useState<FacetStats>(EMPTY_FACET)
  const cap = capOn ? capFamily : null
  const effRatio = effectiveRatio(ratio, cap)

  // Tab 2
  const [S, setS] = useState(S_DEFAULT)
  const [stirring, setStirring] = useState(false)
  const [dlaRun, setDlaRun] = useState(0)
  const [dlaPaused, setDlaPaused] = useState(prefersReducedMotion)
  const [dla, setDla] = useState<DlaStats>(EMPTY_DLA)

  const resetFacet = () => {
    setFacet(EMPTY_FACET)
    setFacetRun((r) => r + 1)
  }
  const resetDla = () => {
    setDla(EMPTY_DLA)
    setDlaRun((r) => r + 1)
  }

  const select = (id: TabId, focus = false) => {
    setTab(id)
    if (focus) tabRefs.current[id]?.focus()
  }
  // WAI-ARIA tabs pattern, as on the homepage.
  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const i = TABS.findIndex((t) => t.id === tab)
    const next =
      e.key === 'ArrowRight' ? (i + 1) % TABS.length
      : e.key === 'ArrowLeft' ? (i - 1 + TABS.length) % TABS.length
      : e.key === 'Home' ? 0
      : e.key === 'End' ? TABS.length - 1
      : -1
    if (next < 0) return
    e.preventDefault()
    select(TABS[next].id, true)
  }

  const scrollToSim = () =>
    requestAnimationFrame(() => document.getElementById('sim-figure')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))

  // CEP links: set the tool up for each example.
  const showCapping = () => {
    setTab('facet')
    setRatio(1)
    setCapOn(true)
    setCapFamily('11')
    setFacetPaused(false)
    resetFacet()
    scrollToSim()
  }
  const showDendrites = () => {
    setTab('diffusion')
    setS(4.5)
    setStirring(false)
    setDlaPaused(false)
    resetDla()
    scrollToSim()
  }

  const survivors = survivingFamilies(effRatio)
  const visible = [facet.len10 > 0 ? FAMILY['10'] : null, facet.len11 > 0 ? FAMILY['11'] : null].filter(Boolean).join(' and ')

  return (
    <article className="page">
      <header className="page-intro compact">
        <a className="back-link" href="#/">
          ← All tools
        </a>
        <h1>Crystal Growth &amp; Shape</h1>
        <p className="lede">
          What controls how fast a crystal grows, and what shape it ends up with? Either the surface or the supply of
          solute is the slow step, and the slow faces win.
        </p>
        <p className="prose crystal-note">
          How crystals are born (nucleation) is covered in Prof. Klupp's nucleation &amp; growth simulation — this page
          starts after the nucleus exists.
        </p>
      </header>

      <figure id="sim-figure" className="figure hero" aria-label="Crystal growth simulator">
        <div className="tab-bar crystal-tabs" role="tablist" aria-label="Growth regime">
          {TABS.map((t) => (
            <button
              key={t.id}
              ref={(el) => {
                tabRefs.current[t.id] = el
              }}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls={`panel-${t.id}`}
              tabIndex={tab === t.id ? 0 : -1}
              className="tab"
              onClick={() => select(t.id)}
              onKeyDown={onTabKey}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ---------- Tab 1: facet growth ---------- */}
        <div role="tabpanel" id="panel-facet" aria-labelledby="tab-facet" hidden={tab !== 'facet'}>
          <p className="prose crystal-intro">
            <strong>Surface-reaction (integration) control:</strong> solute arrives fast, but only attaches at steps
            and kinks. In the <strong>BCF model</strong> a screw dislocation gives a spiral step that never runs out;
            without one, each layer starts from 2D nuclei (<strong>mono-/polynuclear</strong>, birth-and-spread). The
            result is compact, faceted crystals, and stirring does not change the rate.
          </p>
          <div className="crystal-grid">
            <FacetView
              key={facetRun}
              ratio={effRatio}
              paused={facetPaused || tab !== 'facet'}
              showWulff={showWulff}
              gammaRatio={gammaRatio}
              onStats={setFacet}
              label={`Crystal: ${SHAPE_NAME[facet.name]}, ${visible || 'no'} faces visible`}
            />
            <div className="crystal-side">
              <div className="coverage">
                <span className="coverage-label">Current shape</span>
                <span className="coverage-value colloid">{SHAPE_NAME[facet.name]}</span>
              </div>
              <dl className="results">
                <div>
                  <dt>{'{10}'} face length (a.u.)</dt>
                  <dd className="lang-ink">{facet.len10.toFixed(0)}</dd>
                </div>
                <div>
                  <dt>{'{11}'} face length (a.u.)</dt>
                  <dd className="bet-ink">{facet.len11.toFixed(0)}</dd>
                </div>
                <div>
                  <dt>Effective g{'{11}'}/g{'{10}'}</dt>
                  <dd>{effRatio.toFixed(2)}</dd>
                </div>
                <div>
                  <dt>Faces that survive (long run)</dt>
                  <dd>{survivors.map((f) => FAMILY[f]).join(' + ')}</dd>
                </div>
              </dl>
              <ul className="layer-legend crystal-legend" aria-label="Legend">
                <li>
                  <span className="key-line" style={{ borderColor: theme.data1 }} /> {'{10}'} faces
                </li>
                <li>
                  <span className="key-line" style={{ borderColor: theme.data2 }} /> {'{11}'} faces
                </li>
                <li>
                  <span className="key-line" style={{ borderColor: theme.axis, borderTopWidth: 1 }} /> earlier outlines
                </li>
                {showWulff && (
                  <li>
                    <span className="dash" /> Wulff shape
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className="figure-controls hero-controls crystal-controls">
            <LogSlider
              id="ratio"
              label={
                <>
                  Growth-rate ratio <em>g</em>
                  <sub>{'{11}'}</sub>/<em>g</em>
                  <sub>{'{10}'}</sub>
                </>
              }
              range={RATIO_RANGE}
              value={ratio}
              onChange={setRatio}
              hint="> 1: diagonal faces grow faster"
            />
            <div className="crystal-toggle">
              <button type="button" className="button" aria-pressed={capOn} onClick={() => setCapOn((c) => !c)}>
                Add capping agent
              </button>
              {capOn && (
                <div className="crystal-toggle-row">
                  <span className="control-label">Adsorbs on</span>
                  <Segmented
                    label="Capping agent adsorbs on"
                    value={capFamily}
                    onChange={setCapFamily}
                    options={[
                      { value: '10', label: '{10}' },
                      { value: '11', label: '{11}' },
                    ]}
                  />
                </div>
              )}
              <small>g of the capped faces × {CAP_FACTOR}</small>
            </div>
            <div className="crystal-toggle">
              <button type="button" className="button" aria-pressed={showWulff} onClick={() => setShowWulff((w) => !w)}>
                Show Wulff shape (equilibrium)
              </button>
            </div>
            <Slider
              id="gamma"
              label={
                <>
                  Surface-energy ratio <em>γ</em>
                  <sub>{'{11}'}</sub>/<em>γ</em>
                  <sub>{'{10}'}</sub>
                </>
              }
              value={gammaRatio.toFixed(2)}
              min={GAMMA_RATIO_RANGE[0]}
              max={GAMMA_RATIO_RANGE[1]}
              step={0.01}
              pos={gammaRatio}
              onChange={setGammaRatio}
              className={showWulff ? undefined : 'inactive'}
              hint={showWulff ? 'sets the dashed Wulff shape' : 'turn on the Wulff shape to see it'}
            />
            <div className="sim-buttons">
              <button type="button" className="button" onClick={() => setFacetPaused((p) => !p)}>
                {facetPaused ? 'Play' : 'Pause'}
              </button>
              <button type="button" className="button" onClick={resetFacet}>
                Reset
              </button>
            </div>
          </div>
          <p className="insight" aria-live="polite">
            g{'{11}'}/g{'{10}'} = {effRatio.toFixed(2)}
            {cap ? ` (capping agent on ${FAMILY[cap]})` : ''}: {habitText(effRatio)}.
            {showWulff && ' The dashed outline is the equilibrium shape; the grown crystal need not match it.'}
          </p>
          <p className="caption">
            <span className="figure-label">Tab 1.</span> Each face family moves outward at its own rate. Fast faces
            shrink at the corners and vanish; slow faces take over. The Wulff shape is drawn with the same area as the
            crystal.
          </p>
        </div>

        {/* ---------- Tab 2: diffusion-limited growth ---------- */}
        <div role="tabpanel" id="panel-diffusion" aria-labelledby="tab-diffusion" hidden={tab !== 'diffusion'}>
          <p className="prose crystal-intro">
            <strong>Diffusion (mass-transfer) control:</strong> the surface could take up more, but solute cannot
            reach it fast enough. Tips stick out into fresher solution and grow fastest, so the crystal turns rough and
            branched (dendritic), especially at high S. Stirring thins the diffusion layer and helps.
          </p>
          <div className="crystal-grid">
            <DlaView
              key={dlaRun}
              S={S}
              stirring={stirring}
              paused={dlaPaused || tab !== 'diffusion'}
              onStats={setDla}
              label={`Diffusion-limited crystal: ${dla.count} particles, ${dlaShape(dla.compactness).toLowerCase()}`}
            />
            <div className="crystal-side">
              <div className="coverage">
                <span className="coverage-label">Current shape</span>
                <span className="coverage-value colloid">{dlaShape(dla.compactness)}</span>
              </div>
              <dl className="results">
                <div>
                  <dt>Particles attached</dt>
                  <dd>
                    {dla.count}
                    {dla.done ? ' (full)' : ''}
                  </dd>
                </div>
                <div>
                  <dt>Sticking probability (single bond)</dt>
                  <dd>{stickProbability(S).toPrecision(2)}</dd>
                </div>
                <div>
                  <dt>Filled share of disc</dt>
                  <dd>{dla.compactness.toFixed(2)}</dd>
                </div>
              </dl>
              <ul className="layer-legend crystal-legend" aria-label="Legend">
                <li>
                  <span className="dot" style={{ background: theme.data2 }} /> seed
                </li>
                <li>
                  <span className="dot" style={{ background: theme.layer1 }} />
                  <span className="dot" style={{ background: theme.layer2 }} /> growth bands (oldest inside)
                </li>
              </ul>
            </div>
          </div>

          <div className="figure-controls hero-controls crystal-controls">
            <Slider
              id="S"
              label={
                <>
                  Supersaturation <em>S</em> = <em>c</em>/<em>c</em>*
                </>
              }
              value={S.toFixed(1)}
              min={S_RANGE[0]}
              max={S_RANGE[1]}
              step={0.1}
              pos={S}
              onChange={setS}
              hint="higher S: walkers stick at first touch"
            />
            <div className="crystal-toggle">
              <button type="button" className="button" aria-pressed={stirring} onClick={() => setStirring((s) => !s)}>
                Stirring (thin diffusion layer)
              </button>
            </div>
            <div className="sim-buttons">
              <button type="button" className="button" onClick={() => setDlaPaused((p) => !p)}>
                {dlaPaused ? 'Play' : 'Pause'}
              </button>
              <button type="button" className="button" onClick={resetDla}>
                Reset
              </button>
            </div>
          </div>
          <p className="insight" aria-live="polite">
            S = {S.toFixed(1)}
            {stirring ? ', stirred' : ''}:{' '}
            {stirring
              ? 'solute is mixed right up to the surface, so gaps fill in and the crystal stays compact.'
              : S >= 3
                ? 'walkers stick at first touch, the tips catch them first, and the crystal branches.'
                : 'a walker touching by one bond usually moves on; it sticks at kinks, so the gaps fill and the crystal stays compact.'}{' '}
            Change S or stirring mid-growth to see the new layers change; Reset to start over.
          </p>
          <p className="caption">
            <span className="figure-label">Tab 2.</span> <strong>DLA</strong> (diffusion-limited aggregation): random
            walkers stick where they first touch the crystal, which gives dendrites at high S.{' '}
            <strong>Kinetic Monte Carlo</strong>: each touch sticks only with a probability; here 1 at a kink and p(S) on a single bond.
          </p>
        </div>

        <RegimePlot S={S} theme={theme} />
        <figcaption>
          <span className="figure-label">Figure 1.</span> Sketch of G vs S. The slower step controls the rate:
          surface integration at low S, diffusion at high S. The marker follows the S slider in Tab 2.
        </figcaption>
      </figure>

      <Equations />

      <section className="section" aria-labelledby="takeaways-title">
        <h2 id="takeaways-title" className="section-title">
          Key takeaways
        </h2>
        <ul className="why-list">
          <li>
            The <strong>slower step</strong> controls growth: surface integration (low S) or diffusion to the surface
            (high S).
          </li>
          <li>
            Surface-reaction control gives <strong>compact, faceted</strong> crystals and does not care about
            stirring. Diffusion control gives <strong>rough, branched</strong> crystals and speeds up with stirring.
          </li>
          <li>
            <strong>Slow faces win:</strong> fast faces (high g, usually high γ) grow out; slow faces (low g, low γ)
            make the habit.
          </li>
          <li>
            The <strong>Wulff shape</strong> (h ∝ γ) is the equilibrium shape. At high S, kinetics wins and the
            crystal can look very different.
          </li>
          <li>
            <strong>Capping agents</strong> adsorb on chosen faces, lower their g, and so make those faces dominate.
          </li>
        </ul>
      </section>

      <section className="section" aria-labelledby="cep-title">
        <h2 id="cep-title" className="section-title">
          Crystal shape in clean energy processes
        </h2>
        <ul className="why-list">
          <li>
            <strong>Fuel-cell catalysts.</strong> Pt-based nanocrystals catalyse the oxygen reduction reaction in PEM
            fuel cells, and their activity depends on which facets are exposed. Capping agents during synthesis slow
            chosen faces, giving shapes such as Pt₃Ni octahedra whose {'{111}'} facets are especially active for oxygen reduction
            (which facet is best depends on the alloy and the electrolyte: in sulfuric acid Pt{'{111}'} is the least active).{' '}
            <button type="button" className="link-button" onClick={showCapping}>
              Try it: cap the {'{11}'} faces in Tab 1
            </button>
          </li>
          <li>
            <strong>Lithium dendrites in batteries.</strong> At high charging current, Li deposition becomes
            diffusion-limited and grows as branched, tip-growing dendrites, like Tab 2 at high S. (At low current lithium
            can still grow as mossy or whisker deposits, pushed from the root through the SEI.) A dendrite can pierce the
            separator and short the cell.{' '}
            <button type="button" className="link-button" onClick={showDendrites}>
              Try it: high S in Tab 2
            </button>
          </li>
        </ul>
      </section>

    </article>
  )
}
