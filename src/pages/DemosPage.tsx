import { useEffect, useRef, useState } from 'react'
import { groupByTopic, TOOLS, type Subtopic } from '../data/subtopics'
import { chipCounts, EXAMPLE_KEYWORD, filterDemos, type TopicFilter } from '../lib/demos'

// Demo library: every finished page as a card, with search and topic filter (logic in src/lib/demos.ts).

function DemoCard({ s }: { s: Subtopic }) {
  return (
    <div className="project-card demo-card">
      <div className="project-head">
        <h3>{s.title}</h3>
        {s.chapter && <span className="tag accent">{s.chapter}</span>}
      </div>
      <p>{s.description}</p>
      <ul className="project-concepts" aria-label="Key concepts">
        {s.concepts.map((c) => (
          <li key={c} className="tag">
            {c}
          </li>
        ))}
      </ul>
      <a className="button primary demo-launch" href={s.href} aria-label={`Launch ${s.title}`}>
        Launch →
      </a>
    </div>
  )
}

/** True when a key press is meant for a text field (so "/" should type, not jump to search). */
const typingIn = (el: Element | null) =>
  el instanceof HTMLElement && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))

export default function DemosPage() {
  const [query, setQuery] = useState('')
  const [topic, setTopic] = useState<TopicFilter>('all')
  const searchRef = useRef<HTMLInputElement>(null)

  // "/" focuses the search box from anywhere on the page, unless the reader is typing in a field.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey || typingIn(document.activeElement)) return
      e.preventDefault()
      searchRef.current?.focus()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const chips = chipCounts(TOOLS, query)
  const groups = groupByTopic(filterDemos(TOOLS, query, topic))

  return (
    <article className="page">
      <header className="page-intro compact">
        <h1>Demos</h1>
        <p className="lede">Every interactive simulator on the site, grouped by course topic.</p>
      </header>

      <div className="demo-toolbar">
        <label className="demo-search">
          <span className="visually-hidden">Search demos</span>
          <input
            ref={searchRef}
            type="search"
            value={query}
            placeholder="Search demos (press / to focus)"
            aria-keyshortcuts="/"
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault()
                setQuery('')
              }
            }}
          />
        </label>
        <div className="chip-row" role="group" aria-label="Filter by topic">
          {chips.map((c) => (
            <button
              key={c.id}
              type="button"
              className="chip"
              aria-pressed={topic === c.id}
              onClick={() => setTopic(c.id)}
            >
              {c.label} <span className="chip-count">{c.count}</span>
            </button>
          ))}
        </div>
      </div>

      <div aria-live="polite">
        {groups.length === 0 ? (
          <p className="demo-empty">
            No demos match your search. Try a keyword such as{' '}
            <button
              type="button"
              className="link-button"
              onClick={() => {
                setQuery(EXAMPLE_KEYWORD)
                setTopic('all')
              }}
            >
              “{EXAMPLE_KEYWORD}”
            </button>
            .
          </p>
        ) : (
          groups.map(({ topic: t, subtopics }) => (
            <section key={t.name} className="project-group" aria-label={t.name}>
              <h2 className="category-title">
                {t.name} <span className="group-count">({subtopics.length})</span>
              </h2>
              <ul className="project-grid">
                {subtopics.map((s) => (
                  <li key={s.id}>
                    <DemoCard s={s} />
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </article>
  )
}
