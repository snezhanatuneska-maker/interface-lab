import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { groupByTopic, TOOLS, UPCOMING, type Subtopic } from '../data/subtopics'

const svg = (children: ReactNode) => (
  <svg viewBox="0 0 48 48" aria-hidden="true" className="tool-icon">
    {children}
  </svg>
)

// Card icons of the finished tools, keyed by subtopic id (the subtopics themselves come from data/subtopics.ts).
const ICONS: Record<string, ReactNode> = {
  'langmuir-bet': svg(
    <>
      <path d="M6 42 V6 M6 42 H44" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <path className="series-1" d="M6 42 C10 24 14 22 26 21 S40 20 44 19" strokeWidth="3" fill="none" />
      <path className="series-2" d="M6 42 C10 26 16 26 26 24 S36 18 42 6" strokeWidth="3" fill="none" />
    </>,
  ),
  'surfactants-cmc': svg(
    <>
      <path d="M4 16 H44" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <path className="series-2" d="M12 16 V8 M20 16 V8 M28 16 V8 M36 16 V8" strokeWidth="2.5" fill="none" />
      <circle cx="24" cy="32" r="9" className="series-1" strokeWidth="3" fill="none" />
      <path className="series-2" d="M24 23 V28 M33 32 H28 M24 41 V36 M15 32 H20" strokeWidth="2.5" fill="none" />
    </>,
  ),
  'wetting-contact-angle': svg(
    <>
      <path d="M4 38 H44" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <path className="series-1" d="M6 38 A10 10 0 0 1 22 38" strokeWidth="3" fill="none" />
      <path className="series-2" d="M29 38 A9 9 0 1 1 39 38" strokeWidth="3" fill="none" />
    </>,
  ),
  'van-der-waals': svg(
    <>
      <path d="M6 6 V42 H44" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <path d="M6 18 H44" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
      <path className="series-1" d="M12 42 C14 30 18 24 24 21 S36 18 44 18" strokeWidth="3" fill="none" />
    </>,
  ),
  'capillary-pressure': svg(
    <>
      <path d="M4 40 H44" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <path d="M18 6 V44 M30 6 V44" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <path className="series-1" d="M18 18 Q24 26 30 18" strokeWidth="3" fill="none" />
    </>,
  ),
  'dlvo-theory': svg(
    <>
      <path d="M6 42 V6 M6 42 H44" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <path className="series-1" d="M6 12 C14 38 22 40 28 20 S38 8 44 14" strokeWidth="3" fill="none" />
      <path className="series-2" d="M6 34 C14 36 22 38 28 32 S38 20 44 26" strokeWidth="2" strokeDasharray="2 2" fill="none" />
    </>
  ),
  'mercury-porosimetry': svg(
    <>
      <path d="M6 42 V6 M6 42 H44" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <path className="series-1" d="M6 16 C16 16 20 38 28 38 S36 20 44 20" strokeWidth="3" fill="none" />
      <path className="series-2" d="M6 26 C16 26 22 10 28 10 S36 32 44 32" strokeWidth="2" strokeDasharray="2 2" fill="none" />
    </>
  ),
  'double-layer': svg(
    <>
      <path d="M6 6 V42 H44" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <path className="series-2" d="M6 10 L12 22" strokeWidth="3" fill="none" />
      <path className="series-1" d="M12 22 C18 34 26 39 44 41" strokeWidth="3" fill="none" />
    </>
  ),
  'crystal-growth': svg(
    <>
      <path className="series-1" d="M14 8 H34 L40 14 V34 L34 40 H14 L8 34 V14 Z" strokeWidth="3" fill="none" />
      <path className="series-2" d="M24 14 L34 24 L24 34 L14 24 Z" strokeWidth="2.5" fill="none" />
    </>
  ),
  'phase-separation': svg(
    <>
      <path d="M6 42 V6 M6 42 H44" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <path className="series-1" d="M9 42 C11 20 18 10 25 10 S39 20 41 42" strokeWidth="3" fill="none" />
      <path className="series-2" d="M16 42 C18 26 21 14 25 10 C29 14 32 26 34 42" strokeWidth="2" strokeDasharray="3 2" fill="none" />
    </>
  ),
  'nucleation-cnt': svg(
    <>
      <path d="M6 6 V42 M6 26 H44" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <path className="series-1" d="M6 26 C12 26 14 8 20 8 S28 30 34 40" strokeWidth="3" fill="none" />
      <path className="series-2" d="M6 26 C12 26 14 20 20 20 S28 30 34 40" strokeWidth="3" fill="none" />
    </>
  ),
  'zeta-potential': svg(
    <>
      <path d="M6 38 H42" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <path className="series-1" d="M12 12 H36 L12 30 H36" strokeWidth="3" fill="none" />
      <circle cx="24" cy="21" r="3" className="series-2" fill="currentColor" />
    </>
  ),
}

const FALLBACK_ICON = svg(<path d="M6 42 V6 M6 42 H44" stroke="currentColor" strokeWidth="2.5" fill="none" />)

function SubtopicCard({ s }: { s: Subtopic }) {
  const body = (
    <>
      <div className="project-head">
        {s.href && (ICONS[s.id] ?? FALLBACK_ICON)}
        <h3>{s.title}</h3>
        {!s.href && <span className="tag">Coming soon</span>}
      </div>
      <p>{s.description}</p>
      <ul className="project-concepts" aria-label="Key concepts">
        {s.concepts.map((c) => (
          <li key={c} className="tag">
            {c}
          </li>
        ))}
      </ul>
      <p className="project-cep">
        <span className="figure-label">Clean energy link:</span> {s.cepLink}
      </p>
      {s.href && <span className="tool-cta">Open simulator →</span>}
    </>
  )
  // Upcoming cards are plain, non-interactive surfaces; only finished tools link out.
  return s.href ? (
    <a href={s.href} className="project-card linked">
      {body}
    </a>
  ) : (
    <div className="project-card">{body}</div>
  )
}

function TopicGroups({ list }: { list: Subtopic[] }) {
  return groupByTopic(list).map(({ topic, subtopics }) => (
    <section key={topic.name} className="project-group" aria-label={topic.name}>
      <h2 className="category-title">{topic.name}</h2>
      <p className="topic-desc">{topic.description}</p>
      <ul className="project-grid">
        {subtopics.map((s) => (
          <li key={s.id}>
            <SubtopicCard s={s} />
          </li>
        ))}
      </ul>
    </section>
  ))
}

type TabId = 'tools' | 'upcoming'
interface Tab {
  id: TabId
  label: string
  list: Subtopic[]
}
// The Upcoming Projects tab disappears once every subtopic has a page.
const ALL_TABS: Tab[] = [
  { id: 'tools', label: 'Tools', list: TOOLS },
  { id: 'upcoming', label: 'Upcoming Projects', list: UPCOMING },
]
const TABS = ALL_TABS.filter((t) => t.list.length > 0)

// The active tab lives in the URL hash so "#upcoming" can be linked directly; anything else is "tools".
const tabFromHash = (): TabId =>
  window.location.hash === '#upcoming' && TABS.some((t) => t.id === 'upcoming') ? 'upcoming' : 'tools'

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
          Simulators for the surfaces behind clean energy. Move a slider, see the physics.
        </p>
      </header>

      {TABS.length > 1 ? (
        <>
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

          {TABS.map((t) => (
            <div
              key={t.id}
              role="tabpanel"
              id={`panel-${t.id}`}
              aria-labelledby={`tab-${t.id}`}
              hidden={tab !== t.id}
              className="tab-panel"
            >
              <TopicGroups list={t.list} />
            </div>
          ))}
        </>
      ) : (
        // Every subtopic has a page: show the tools on their own, without a tab bar.
        <div className="tab-panel">
          <TopicGroups list={TOOLS} />
        </div>
      )}
    </article>
  )
}
