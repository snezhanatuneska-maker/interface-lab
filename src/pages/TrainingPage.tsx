import { TRAINERS } from '../data/trainers'

// Training index (#/training): one card per trainer, from src/data/trainers.ts.

export default function TrainingPage() {
  return (
    <article className="page">
      <header className="page-intro compact">
        <h1>Training</h1>
        <p className="lede">
          Randomized practice problems with worked solutions. Pick a difficulty, answer with a click or the keys 1–4, or
          take a 10-question exam.
        </p>
      </header>
      <ul className="project-grid">
        {TRAINERS.map((t) => (
          <li key={t.id}>
            <a href={t.href} className="project-card linked">
              <div className="project-head">
                <h3>{t.title}</h3>
                <span className="tag">{t.topic}</span>
              </div>
              <p>{t.description}</p>
              <span className="tool-cta">Start training →</span>
            </a>
          </li>
        ))}
      </ul>
    </article>
  )
}
