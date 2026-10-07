import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import UpcomingProjects from '../components/UpcomingProjects'

interface Tool {
  title: string
  blurb: string
  href?: string // undefined = coming soon
  icon: ReactNode
}

const svg = (children: ReactNode) => (
  <svg viewBox="0 0 48 48" aria-hidden="true" className="tool-icon">
    {children}
  </svg>
)

const TOOLS: Tool[] = [
  {
    title: 'Langmuir vs BET Adsorption',
    blurb:
      'Watch gas molecules adsorb on a surface: a single Langmuir monolayer vs stacking BET multilayers, with both isotherm equations explained.',
    href: '#/adsorption',
    icon: svg(
      <>
        <path d="M6 42 V6 M6 42 H44" stroke="currentColor" strokeWidth="2.5" fill="none" />
        <path className="series-1" d="M6 42 C10 24 14 22 26 21 S40 20 44 19" strokeWidth="3" fill="none" />
        <path className="series-2" d="M6 42 C10 26 16 26 26 24 S36 18 42 6" strokeWidth="3" fill="none" />
      </>,
    ),
  },
  {
    title: 'Contact Angle & Wetting',
    blurb: 'Young’s equation, surface energies, and how droplets spread on electrodes and membranes.',
    icon: svg(
      <>
        <path d="M4 38 H44" stroke="currentColor" strokeWidth="2.5" />
        <path d="M10 38 A14 14 0 0 1 38 38" fill="currentColor" opacity="0.35" />
      </>,
    ),
  },
  {
    title: 'DLVO Colloid Stability',
    blurb: 'Van der Waals attraction plus double-layer repulsion: when do particles in a slurry or ink aggregate?',
    icon: svg(
      <>
        <path d="M6 42 V6 M6 24 H44" stroke="currentColor" strokeWidth="2.5" fill="none" />
        <path d="M9 44 C11 18 14 12 20 14 S30 26 44 24" stroke="currentColor" strokeWidth="3" fill="none" />
      </>,
    ),
  },
  {
    title: 'Nucleation & Growth',
    blurb: 'Classical nucleation theory: the critical radius, the energy barrier, and how supersaturation controls particle size.',
    icon: svg(
      <>
        <circle cx="14" cy="30" r="4" fill="currentColor" opacity="0.5" />
        <circle cx="26" cy="24" r="7" fill="currentColor" opacity="0.5" />
        <circle cx="38" cy="18" r="10" fill="currentColor" opacity="0.5" />
      </>,
    ),
  },
]

type TabId = 'tools' | 'upcoming'
const TABS: { id: TabId; label: string }[] = [
  { id: 'tools', label: 'Tools' },
  { id: 'upcoming', label: 'Upcoming Projects' },
]

// The active tab lives in the URL hash so "#upcoming" can be linked directly; anything else is "tools".
const tabFromHash = (): TabId => (window.location.hash === '#upcoming' ? 'upcoming' : 'tools')

export default function HomePage() {
  const available = TOOLS.filter((t) => t.href)
  const upcoming = TOOLS.filter((t) => !t.href)

  const [tab, setTab] = useState<TabId>(tabFromHash)
  const tabRefs = useRef<Record<TabId, HTMLButtonElement | null>>({ tools: null, upcoming: null })

  useEffect(() => {
    const onHash = () => setTab(tabFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const select = (id: TabId, focus = false) => {
    setTab(id)
    // replaceState keeps the back button free of tab clicks and does not trigger the router's scroll-to-top.
    history.replaceState(null, '', id === 'upcoming' ? '#upcoming' : '#/')
    if (focus) tabRefs.current[id]?.focus()
  }

  // WAI-ARIA tabs pattern: arrows move between tabs (wrapping), Home/End jump to the ends.
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

  return (
    <article className="page">
      <header className="page-intro">
        <p className="eyebrow">Interface engineering for clean energy processes</p>
        <h1>Interface Engineering Lab</h1>
        <p className="lede">
          Interactive simulators for the surface and interface phenomena behind clean energy technologies: catalysts,
          fuel cells, batteries and gas storage. Move a slider, see the physics.
        </p>
      </header>

      <div className="tab-bar" role="tablist" aria-label="Homepage sections">
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

      <div role="tabpanel" id="panel-tools" aria-labelledby="tab-tools" hidden={tab !== 'tools'} className="tab-panel">
        <section aria-labelledby="tools-title">
          <h2 id="tools-title" className="section-title">
            Simulators
          </h2>
          <ul className="tool-list">
            {available.map((t) => (
              <li key={t.title}>
                <a href={t.href} className="tool-card">
                  {t.icon}
                  <div>
                    <h3>{t.title}</h3>
                    <p>{t.blurb}</p>
                    <span className="tool-cta">Open simulator →</span>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="section" aria-labelledby="upcoming-title">
          <h2 id="upcoming-title" className="section-title">
            In preparation
          </h2>
          <ul className="upcoming-list">
            {upcoming.map((t) => (
              <li key={t.title}>
                {t.icon}
                <div>
                  <h3>{t.title}</h3>
                  <p>{t.blurb}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div
        role="tabpanel"
        id="panel-upcoming"
        aria-labelledby="tab-upcoming"
        hidden={tab !== 'upcoming'}
        className="tab-panel"
      >
        <UpcomingProjects />
      </div>
    </article>
  )
}
