import { SUBTOPICS } from '../data/subtopics'
import { trainersFor } from '../data/trainers'
import { examFor } from '../data/exam'

/** Under a topic page: links to the trainers that practise it (all practice lives on #/training). */
export default function PracticeLinks({ route }: { route: string }) {
  const s = SUBTOPICS.find((x) => x.href === `#${route}`)
  const trainers = s ? trainersFor(s.id) : []
  const exam = s ? examFor(s.topic) : undefined
  if (trainers.length === 0 && !exam) return null
  return (
    <aside className="section practice-links" aria-labelledby="practice-title">
      <h2 id="practice-title" className="section-title">
        Practise this topic
      </h2>
      <ul>
        {trainers.map((t) => (
          <li key={t.id}>
            <a href={t.href}>{t.title} →</a> <span className="note">{t.description}</span>
          </li>
        ))}
        {exam && (
          <li>
            <a href={`#/exam/${exam.id}`}>Exam practice →</a> <span className="note">Specimen-exam questions on {exam.title}, with model solutions.</span>
          </li>
        )}
      </ul>
    </aside>
  )
}
