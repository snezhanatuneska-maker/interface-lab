import { useState } from 'react'

// Multiple-choice questions drawn like the Adsorption tool's "Try this" cards.
// Used by the Zeta, DLVO and MIP pages.

export interface CheckQuestion {
  id: number
  title: string
  description: string
  prompt: string
  /** Options as written, e.g. "A. …"; the letter prefix is drawn separately. */
  options: string[]
  /** Index of the correct option. */
  correct: number
  explanation: string
}

const stripLetter = (o: string) => o.replace(/^[A-Z]\.\s*/, '')
const stripCorrect = (e: string) => e.replace(/^Correct!\s*/, '')

function Question({ q, target }: { q: CheckQuestion; target: string }) {
  const [picked, setPicked] = useState<number | null>(null)
  const right = picked === q.correct
  const revealed = picked !== null
  const setUp = () => document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  return (
    <li className="card try-card">
      <div className="try-head">
        <h3>{q.title}</h3>
        <button type="button" className="button" onClick={setUp}>
          Set it up
        </button>
      </div>
      <p>{q.description}</p>
      <fieldset className="choices">
        <legend>{q.prompt}</legend>
        {q.options.map((o, i) => {
          // Once answered, the correct option is always marked, and a wrong pick is marked too.
          const state = revealed ? (i === q.correct ? ' correct' : i === picked ? ' wrong' : '') : ''
          return (
            <button
              key={o}
              type="button"
              className={`choice${state}`}
              aria-pressed={picked === i}
              onClick={() => setPicked(i)}
            >
              <span className="choice-letter">{String.fromCharCode(65 + i)}</span> {stripLetter(o)}
              {state && (
                <span className="choice-mark" aria-hidden="true">
                  {i === q.correct ? '✓' : '✗'}
                </span>
              )}
            </button>
          )
        })}
      </fieldset>
      <div aria-live="polite">
        {revealed && (
          <p className={`feedback ${right ? 'correct' : 'wrong'}`}>
            <strong>{right ? 'Correct!' : 'Not quite right.'}</strong> {stripCorrect(q.explanation)}
          </p>
        )}
      </div>
      {revealed && (
        <button type="button" className="link-button" onClick={() => setPicked(null)}>
          Reset
        </button>
      )}
    </li>
  )
}

export default function KnowledgeCheck({
  title,
  questions,
  target = 'sim-figure',
}: {
  title: string
  questions: CheckQuestion[]
  /** Element "Set it up" scrolls to. */
  target?: string
}) {
  return (
    <section className="section" aria-labelledby="check-title">
      <h2 id="check-title" className="section-title">
        {title}
      </h2>
      <ol className="try-list">
        {questions.map((q) => (
          <Question key={q.id} q={q} target={target} />
        ))}
      </ol>
    </section>
  )
}
