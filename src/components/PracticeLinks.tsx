import { SUBTOPICS } from '../data/subtopics'
import { trainersFor } from '../data/trainers'

/** Under a topic page: links to the trainers that practise it (all practice lives on #/training). */
export default function PracticeLinks({ route }: { route: string }) {
  const s = SUBTOPICS.find((x) => x.href === `#${route}`)
  const trainers = s ? trainersFor(s.id) : []
  if (trainers.length === 0) return null
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
      </ul>
    </aside>
  )
}
