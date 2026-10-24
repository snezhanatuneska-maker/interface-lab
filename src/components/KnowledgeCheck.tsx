import { useState } from 'react'

// Multiple-choice questions drawn like the Adsorption tool's "Try this" cards.
// Used by the Zeta, DLVO, MIP, EDL and phase-separation pages.

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
  /** Element this question's "Set it up" scrolls to; defaults to the check's target. */
  target?: string
}

const stripLetter = (o: string) => o.replace(/^[A-Z]\.\s*/, '')
const stripCorrect = (e: string) => e.replace(/^Correct!\s*/, '')

function Question({ q, target, onPick }: { q: CheckQuestion; target: string; onPick: (i: number | null) => void }) {
  const [picked, setPickedState] = useState<number | null>(null)
  const setPicked = (i: number | null) => {
    setPickedState(i)
    onPick(i)
  }
  const right = picked === q.correct
  const revealed = picked !== null
  const setUp = () => document.getElementById(q.target ?? target)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
  showScore = false,
}: {
  title: string
  questions: CheckQuestion[]
  /** Element "Set it up" scrolls to. */
  target?: string
  /** Show a running score under the questions. */
  showScore?: boolean
}) {
  const [picks, setPicks] = useState<Record<number, number | null>>({})
  const answered = questions.filter((q) => picks[q.id] != null)
  const score = answered.filter((q) => picks[q.id] === q.correct).length
  return (
    <section className="section" aria-labelledby="check-title">
      <h2 id="check-title" className="section-title">
        {title}
      </h2>
      <ol className="try-list">
        {questions.map((q) => (
          <Question key={q.id} q={q} target={target} onPick={(i) => setPicks((p) => ({ ...p, [q.id]: i }))} />
        ))}
      </ol>
      {showScore && (
        <p className="quiz-score" aria-live="polite">
          {answered.length === questions.length ? (
            <>
              <strong>
                Score: {score} / {questions.length}
              </strong>
              {score === questions.length ? ' All correct.' : ' Reset a question to try it again.'}
            </>
          ) : (
            <>
              Answered {answered.length} of {questions.length}
              {answered.length > 0 && <> · {score} correct so far</>}
            </>
          )}
        </p>
      )}
    </section>
  )
}
