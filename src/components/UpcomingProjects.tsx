import { useState } from 'react'
import { PROJECTS, type Project } from '../data/upcomingProjects'

// "Next up" shows the few tools being built now; the full roadmap sits in a collapsed section below.
const NEXT = PROJECTS.filter((p) => p.status === 'planned' && p.next)
const LATER = PROJECTS.filter((p) => p.status === 'planned' && !p.next)
// Category order follows first appearance in the data file.
const CATEGORIES = [...new Set(LATER.map((p) => p.category))]

function ProjectCard({ p }: { p: Project }) {
  const live = p.status === 'live' && p.href
  const body = (
    <>
      <div className="project-head">
        <h3>{p.title}</h3>
        <span className={live ? 'tag accent' : 'tag'}>{live ? 'Live' : 'Coming soon'}</span>
      </div>
      <p>{p.description}</p>
      <ul className="project-concepts" aria-label="Key concepts">
        {p.concepts.map((c) => (
          <li key={c} className="tag">
            {c}
          </li>
        ))}
      </ul>
      <p className="project-cep">
        <span className="figure-label">Clean energy link:</span> {p.cepLink}
      </p>
      {live && <span className="tool-cta">Open simulator →</span>}
    </>
  )
  // Planned cards are plain, non-interactive surfaces; only live tools link out.
  return live ? (
    <a href={p.href} className="project-card linked">
      {body}
    </a>
  ) : (
    <div className="project-card">{body}</div>
  )
}

export default function UpcomingProjects() {
  const [filter, setFilter] = useState<string | null>(null)
  const shown = filter ? [filter] : CATEGORIES

  return (
    <>
      <p className="lede upcoming-intro">
        Tools in progress.
      </p>

      <section className="project-group" aria-labelledby="next-title">
        <h2 id="next-title" className="category-title">
          Next up
        </h2>
        <ul className="project-grid">
          {NEXT.map((p) => (
            <li key={p.id}>
              <ProjectCard p={p} />
            </li>
          ))}
        </ul>
      </section>

      <details className="roadmap">
        <summary>Full roadmap ({LATER.length} more planned tools)</summary>
        <div className="filter-chips" role="group" aria-label="Filter by category">
          {[null, ...CATEGORIES].map((c) => (
            <button
              key={c ?? 'all'}
              type="button"
              className="chip"
              aria-pressed={filter === c}
              onClick={() => setFilter(c)}
            >
              {c ?? 'All'}
            </button>
          ))}
        </div>

        {shown.map((cat) => (
          <section key={cat} className="project-group" aria-label={cat}>
            <h2 className="category-title">{cat}</h2>
            <ul className="project-grid">
              {LATER.filter((p) => p.category === cat).map((p) => (
                <li key={p.id}>
                  <ProjectCard p={p} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </details>
    </>
  )
}
