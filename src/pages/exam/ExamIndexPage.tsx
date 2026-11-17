import { EXAM_TOPICS, partPoints } from '../../data/exam'

// Exam practice index (#/exam): one card per topic with specimen-exam questions.

export default function ExamIndexPage() {
  return (
    <article className="page">
      <header className="page-intro compact">
        <h1>Exam Practice</h1>
        <p className="lede">
          Questions from the course’s specimen exam, sorted by topic, with points as in the exam. Answer them in exam
          mode against the clock, or open the model solutions in study mode. The model solutions are written for this
          site and are not official answers.
        </p>
      </header>
      <ul className="project-grid">
        {EXAM_TOPICS.map((e) => (
          <li key={e.id}>
            <a href={`#/exam/${e.id}`} className="project-card linked">
              <div className="project-head">
                <h3>{e.title}</h3>
                <span className="tag">{partPoints(e)} points</span>
              </div>
              <p>{e.source}.</p>
              <span className="tool-cta">Start →</span>
            </a>
          </li>
        ))}
      </ul>
      <p className="note">More topics will be added here.</p>
    </article>
  )
}
