import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import UpcomingProjects from '../components/UpcomingProjects'
import { COURSE } from '../siteConfig'

interface Tool {
  title: string
  blurb: string
  topics: string
  href: string
}

const TOOLS: Tool[] = [
  {
    title: 'Langmuir vs BET adsorption',
    blurb:
      'Gas molecules adsorbing on a solid surface, next to the adsorption isotherm. In the Langmuir model the surface saturates at one monolayer; in the BET model molecules keep stacking into multilayers as the relative pressure approaches 1.',
    topics: 'adsorption isotherm, monolayer capacity, BET constant c, relative pressure P/P₀',
    href: '#/adsorption',
  },
]

type TabId = 'tools' | 'upcoming'
const TABS: { id: TabId; label: string }[] = [
  { id: 'tools', label: 'Available' },
  { id: 'upcoming', label: 'Planned' },
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
      <header className="doc-head">
        <h1>Interface Engineering Lab</h1>
        <p className="doc-meta">Course: {COURSE} (CEP)</p>
        <p className="doc-summary">
          Small simulations that go with the lecture notes on surfaces and interfaces, each with the governing
          equations and the assumptions behind them.
        </p>
      </header>

      <div className="tab-bar" role="tablist" aria-label="Contents">
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
        <h2 className="visually-hidden">Available simulations</h2>
        <ol className="toc">
          {TOOLS.map((t, i) => (
            <li key={t.title}>
              <span className="toc-num">{i + 1}.</span>
              <div>
                <h3>
                  <a href={t.href}>{t.title}</a>
                </h3>
                <p>{t.blurb}</p>
                <p className="toc-topics">
                  <span className="label">Topics:</span> {t.topics}
                </p>
              </div>
            </li>
          ))}
        </ol>
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
