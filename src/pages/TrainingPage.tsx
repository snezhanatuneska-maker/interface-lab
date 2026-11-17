import { TOPICS } from '../data/subtopics'
import { TRAINERS, type Trainer } from '../data/trainers'

// Training index (#/training): one card per trainer, grouped by topic (or by the trainer's group, e.g. an exercise
// sheet), from src/data/trainers.ts.

function Card({ t }: { t: Trainer }) {
  return (
    <li>
      <a href={t.href} className="project-card linked">
        <div className="project-head">
          <h3>{t.title}</h3>
        </div>
        <p>{t.description}</p>
        <span className="tool-cta">{t.kind === 'exercise' ? 'Open exercise →' : 'Start training →'}</span>
      </a>
    </li>
  )
}

export default function TrainingPage() {
  const groups = TOPICS.flatMap((topic) => {
    const list = TRAINERS.filter((t) => t.topic === topic.name)
    const names = [...new Set(list.map((t) => t.group ?? topic.name))]
    return names.map((name) => ({ name, trainers: list.filter((t) => (t.group ?? topic.name) === name), topic: topic.name }))
  }).filter((g) => g.trainers.length > 0)
  return (
    <article className="page">
      <header className="page-intro compact">
        <h1>Training</h1>
        <p className="lede">
          The course exercises with worked solutions, and randomized practice problems for the other topics: pick a
          difficulty, answer with a click or the keys 1–4, or take a 10-question exam.
        </p>
        <p className="note">
          Preparing for the exam? <a href="#/exam">Exam practice →</a>
        </p>
      </header>
      {groups.map(({ name, trainers, topic }) => (
        <section key={name} className="project-group" aria-label={name}>
          <h2 className="category-title">{name}</h2>
          <ul className="project-grid">
            {trainers.map((t) => (
              <Card key={t.id} t={t} />
            ))}
          </ul>
          {topic === 'Liquid Interfaces' && (
            <p className="note">
              <a href="#/exam/liquid-interfaces">Exam practice: Liquid Interfaces (specimen exam) →</a>
            </p>
          )}
        </section>
      ))}
    </article>
  )
}
