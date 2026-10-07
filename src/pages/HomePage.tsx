import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import UpcomingProjects from '../components/UpcomingProjects'
import { PROJECTS } from '../data/upcomingProjects'

const svg = (children: ReactNode) => (
  <svg viewBox="0 0 48 48" aria-hidden="true" className="tool-icon">
    {children}
  </svg>
)

// Card icons of the live tools, keyed by project id (the tools themselves come from data/upcomingProjects.ts).
const ICONS: Record<string, ReactNode> = {
  'langmuir-bet': svg(
    <>
      <path d="M6 42 V6 M6 42 H44" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <path className="series-1" d="M6 42 C10 24 14 22 26 21 S40 20 44 19" strokeWidth="3" fill="none" />
      <path className="series-2" d="M6 42 C10 26 16 26 26 24 S36 18 42 6" strokeWidth="3" fill="none" />
    </>,
  ),
}

const TOOLS = PROJECTS.filter((p) => p.status === 'live' && p.href)

type TabId = 'tools' | 'upcoming'
const TABS: { id: TabId; label: string }[] = [
  { id: 'tools', label: 'Tools' },
  { id: 'upcoming', label: 'Upcoming Projects' },
]

// The active tab lives in the URL hash so "#upcoming" can be linked directly; anything else is "tools".
const tabFromHash = (): TabId => (window.location.hash === '#upcoming' ? 'upcoming' : 'tools')

export default function HomePage() {
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
        <p className="eyebrow">Interface Engineering in Clean Energy Processes (CEP)</p>
        <h1>Interface Engineering Lab</h1>
        <p className="lede">
          Interactive simulators for the surface and interface phenomena behind clean energy technologies: catalysts,
          fuel cells, electrolyzers, batteries and gas storage. Move a slider, see the physics.
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
            {TOOLS.map((t) => (
              <li key={t.id}>
                <a href={t.href} className="tool-card">
                  {ICONS[t.id] ?? svg(<path d="M6 42 V6 M6 42 H44" stroke="currentColor" strokeWidth="2.5" fill="none" />)}
                  <div>
                    <h3>{t.title}</h3>
                    <p>{t.description}</p>
                    <span className="tool-cta">Open simulator →</span>
                  </div>
                </a>
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
