import { TOPICS } from '../data/subtopics'
import { TRAINERS } from '../data/trainers'

// Training index (#/training): one card per trainer, grouped by topic, from src/data/trainers.ts.

export default function TrainingPage() {
  const groups = TOPICS.map((topic) => ({ topic, trainers: TRAINERS.filter((t) => t.topic === topic.name) })).filter((g) => g.trainers.length > 0)
  return (
    <article className="page">
      <header className="page-intro compact">
        <h1>Training</h1>
        <p className="lede">
          Randomized practice problems with worked solutions for every topic. Pick a difficulty, answer with a click or
          the keys 1–4, or take a 10-question exam.
        </p>
      </header>
      {groups.map(({ topic, trainers }) => (
        <section key={topic.name} className="project-group" aria-label={topic.name}>
          <h2 className="category-title">{topic.name}</h2>
          <ul className="project-grid">
            {trainers.map((t) => (
              <li key={t.id}>
                <a href={t.href} className="project-card linked">
                  <div className="project-head">
                    <h3>{t.title}</h3>
                  </div>
                  <p>{t.description}</p>
                  <span className="tool-cta">Start training →</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </article>
  )
}
