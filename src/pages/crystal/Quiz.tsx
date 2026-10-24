import { useState } from 'react'

// Multiple-choice check drawn like the Adsorption tool's "Try this" cards. Each question locks after the
// first pick (instant feedback and explanation); the score appears once every question is answered.

interface Question {
  title: string
  prompt: string
  options: string[]
  /** Index of the correct option. */
  correct: number
  why: string
}

const QUESTIONS: Question[] = [
  {
    title: 'Final habit',
    prompt: 'Which faces dominate the final crystal habit?',
    options: ['The fastest-growing faces', 'The slowest-growing faces', 'The faces with the highest γ', 'All faces equally'],
    correct: 1,
    why: 'Fast faces move out quickly, shrink and disappear at the corners. The slow faces are left to bound the crystal.',
  },
  {
    title: 'Capping agent',
    prompt: 'A capping agent adsorbs strongly on face A. What happens?',
    options: [
      'A grows faster and disappears',
      'The shape does not change',
      'A grows slower and becomes larger (more expressed)',
      'The crystal dissolves',
    ],
    correct: 2,
    why: 'Adsorbed molecules block the steps and kinks of face A, so its g drops. Slow faces dominate the habit, so A grows in area.',
  },
  {
    title: 'High supersaturation',
    prompt: 'At very high supersaturation, crystals tend to become…',
    options: ['perfectly faceted', 'spherical and smooth', 'equal to the Wulff shape', 'branched / dendritic (diffusion-limited)'],
    correct: 3,
    why: 'At high S the surface can take up solute faster than diffusion brings it. Tips reach further into the solution and grow faster: dendrites.',
  },
  {
    title: 'BCF model',
    prompt: 'In the BCF model, growth proceeds mainly via…',
    options: [
      'random attachment anywhere on the face',
      'spiral steps created by screw dislocations',
      '2D nuclei only',
      'dissolution of edges',
    ],
    correct: 1,
    why: 'A screw dislocation leaves a step that never runs out: it winds up into a spiral. Without it, each new layer needs a 2D nucleus (birth-and-spread).',
  },
  {
    title: 'Wulff construction',
    prompt: 'In the Wulff construction, the distance of a face from the crystal centre is proportional to…',
    options: ['its growth rate only', 'its surface energy γ', 'the crystal density', 'the supersaturation'],
    correct: 1,
    why: 'The equilibrium shape minimises total surface energy: h ∝ γ. High-γ faces sit far out and end up small or absent.',
  },
  {
    title: 'Stirring',
    prompt: 'Stirring the solution strongly increases the growth rate. The growth is most likely…',
    options: [
      'surface-reaction controlled',
      'diffusion (mass-transfer) controlled',
      'equilibrium-shape controlled',
      'independent of S',
    ],
    correct: 1,
    why: 'Stirring thins the diffusion layer (higher Sh), which only helps if transport to the surface is the slow step.',
  },
  {
    title: 'Shape factors',
    prompt: 'For a sphere of diameter x, the shape factors in A = βx² and V = αx³ are…',
    options: ['β = 4π, α = 4π/3', 'β = π/6, α = π', 'β = π, α = π/6', 'β = 6, α = 1'],
    correct: 2,
    why: 'A = πx² and V = πx³/6 for a sphere of diameter x. (4π and 4π/3 go with the radius; 6 and 1 are a cube.)',
  },
  {
    title: 'Lithium dendrites (CEP)',
    prompt: 'Lithium dendrites in batteries form mainly when…',
    options: [
      'the charging current is very low',
      'the electrolyte is stirred',
      'the electrode is perfectly smooth',
      'the charging current is high and growth becomes diffusion-limited',
    ],
    correct: 3,
    why: 'At high current Li⁺ is used up at the surface faster than it diffuses in, so deposition is diffusion-limited and branches, like Tab 2 at high S.',
  },
]

function Card({ q, picked, onPick }: { q: Question; picked: number | null; onPick: (i: number) => void }) {
  const revealed = picked !== null
  const right = picked === q.correct
  return (
    <li className="card try-card">
      <div className="try-head">
        <h3>{q.title}</h3>
      </div>
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
              disabled={revealed}
              onClick={() => onPick(i)}
            >
              <span className="choice-letter">{String.fromCharCode(65 + i)}</span> {o}
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
            <strong>{right ? 'Correct.' : 'Not quite.'}</strong> {q.why}
          </p>
        )}
      </div>
    </li>
  )
}

export default function Quiz() {
  const [picks, setPicks] = useState<(number | null)[]>(() => QUESTIONS.map(() => null))
  const answered = picks.filter((p) => p !== null).length
  const score = picks.filter((p, i) => p === QUESTIONS[i].correct).length
  const done = answered === QUESTIONS.length

  const retry = () => {
    setPicks(QUESTIONS.map(() => null))
    document.getElementById('quiz-title')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section className="section" aria-labelledby="quiz-title">
      <h2 id="quiz-title" className="section-title">
        Check your understanding
      </h2>
      <p className="prose">Pick an answer: you get feedback right away. Your score appears at the end.</p>
      <ol className="try-list">
        {QUESTIONS.map((q, i) => (
          <Card key={q.title} q={q} picked={picks[i]} onPick={(p) => setPicks((ps) => ps.map((x, j) => (j === i ? p : x)))} />
        ))}
      </ol>
      <div className="card quiz-score" aria-live="polite">
        {done ? (
          <>
            <p>
              <strong>
                Score: {score} / {QUESTIONS.length}
              </strong>
              {score === QUESTIONS.length ? ' All correct.' : ' Read the explanations above, then try again.'}
            </p>
            <button type="button" className="button primary" onClick={retry}>
              Try again
            </button>
          </>
        ) : (
          <p>
            Answered {answered} of {QUESTIONS.length}.
          </p>
        )}
      </div>
    </section>
  )
}
