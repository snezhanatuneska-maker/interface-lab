import { useState } from 'react'
import { PROJECTS, type Project } from '../data/upcomingProjects'

// Category order follows first appearance in the data file.
const CATEGORIES = [...new Set(PROJECTS.map((p) => p.category))]

function ProjectEntry({ p }: { p: Project }) {
  const live = p.status === 'live' && p.href
  return (
    <li className="project">
      <h4>
        {live ? <a href={p.href}>{p.title}</a> : p.title}{' '}
        <span className={live ? 'status live' : 'status'}>[{live ? 'available' : 'planned'}]</span>
      </h4>
      <p>{p.description}</p>
      <p className="project-meta">
        <span className="label">Concepts:</span> {p.concepts.join('; ')}
      </p>
      <p className="project-meta">
        <span className="label">CEP relevance:</span> {p.cepLink}
      </p>
    </li>
  )
}

export default function UpcomingProjects() {
  const [filter, setFilter] = useState<string | null>(null)
  const shown = filter ? [filter] : CATEGORIES

  return (
    <>
      <p className="upcoming-intro">
        Simulations I plan to add for the rest of the course, grouped by lecture topic. Only the adsorption one is
        finished so far.
      </p>

      <div className="filter-row" role="group" aria-label="Filter by topic">
        <span className="label">Topic:</span>
        {[null, ...CATEGORIES].map((c) => (
          <button key={c ?? 'all'} type="button" className="filter" aria-pressed={filter === c} onClick={() => setFilter(c)}>
            {c ?? 'all'}
          </button>
        ))}
      </div>

      {shown.map((cat) => (
        <section key={cat} className="project-group" aria-label={cat}>
          <h3 className="category-title">
            {CATEGORIES.indexOf(cat) + 1}. {cat}
          </h3>
          <ul className="project-list">
            {PROJECTS.filter((p) => p.category === cat).map((p) => (
              <ProjectEntry key={p.id} p={p} />
            ))}
          </ul>
        </section>
      ))}
    </>
  )
}
