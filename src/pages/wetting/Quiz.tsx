import { useState, type ReactNode } from 'react'

// One question at a time with instant feedback, a score at the end and Retry. Options are shuffled on every attempt.
// The numeric answers (59°, 121°, 159°) are checked against the model in src/lib/wetting.test.ts.

interface Question {
  question: string
  /** The first option is the correct one; they are shuffled before display. */
  options: string[]
  why: string
}

const QUESTIONS: Question[] = [
  {
    question: "Young's equation balances which three interfacial tensions?",
    options: ['γ_SV, γ_SL and γ_LV', 'Only γ_LV and gravity', 'γ_SV and γ_LV only', 'Viscosity, density and γ_LV'],
    why: 'Solid–vapor, solid–liquid and liquid–vapor tensions balance along the surface at the contact line.',
  },
  {
    question: 'A surface has θ_Y = 70°. It is roughened to r = 1.5 (Wenzel state). The apparent angle becomes…',
    options: ['About 59°, more hydrophilic', 'About 80°', 'Unchanged at 70°', 'About 105°'],
    why: 'cos θ_W = 1.5 × cos 70° = 0.51, so θ_W ≈ 59°. Below 90°, roughness makes the surface wet even more.',
  },
  {
    question: 'Same roughness r = 1.5, but θ_Y = 110°. The Wenzel angle is…',
    options: ['About 121°, more hydrophobic', 'About 99°, less hydrophobic', 'Unchanged at 110°', 'About 59°'],
    why: 'cos θ_W = 1.5 × cos 110° = −0.51, so θ_W ≈ 121°. Above 90°, roughness makes the surface repel more.',
  },
  {
    question: 'In the Cassie–Baxter state the droplet…',
    options: [
      'Rests partly on air trapped in the surface texture',
      'Fills all the grooves',
      'Spreads into a film',
      'Dissolves into the solid',
    ],
    why: 'The drop touches only the tops of the texture (fraction f_s); the rest of its base sits on air.',
  },
  {
    question: 'θ_Y = 110°, f_s = 0.1. The Cassie–Baxter angle is approximately…',
    options: ['About 159° (superhydrophobic)', 'About 121°', 'About 110°', 'About 180°'],
    why: 'cos θ_CB = 0.1 × (cos 110° + 1) − 1 = −0.93, so θ_CB ≈ 159°, above 150°.',
  },
  {
    question: "What does Wenzel's equation say roughness does?",
    options: [
      "Amplifies the surface's existing wetting tendency",
      'Makes every surface more hydrophobic',
      'Makes every surface more hydrophilic',
      'Has no effect on the contact angle',
    ],
    why: 'cos θ_W = r cos θ_Y with r ≥ 1: the cosine keeps its sign and grows, so below 90° goes lower, above 90° goes higher.',
  },
  {
    question: 'Why does a drop roll off a lotus leaf but stick on a rough Wenzel surface?',
    options: [
      'In Cassie–Baxter it touches little solid, so it is weakly pinned',
      'The lotus leaf is perfectly smooth',
      'The Wenzel drop has a higher contact angle',
      'Gravity is stronger on the lotus leaf',
    ],
    why: 'A Wenzel drop fills the grooves and is pinned in them; a Cassie–Baxter drop rests mostly on air.',
  },
  {
    question: 'Why is the gas diffusion layer in a PEM fuel cell treated with PTFE?',
    options: [
      "To make it hydrophobic so liquid water is expelled and pores don't flood",
      'To make it hydrophilic so water spreads through it',
      'To raise its electrical conductivity',
      'To make the catalyst more active',
    ],
    why: 'PTFE raises θ_Y above 90°; on the rough carbon paper this repels water, keeping gas paths open.',
  },
]

/** Shows "θ_Y", "γ_SV", "f_s" with real subscripts. */
function sub(text: string): ReactNode {
  return text.split(/([θγf])_([A-Za-z]+)/).map((part, i) =>
    i % 3 === 2 ? <sub key={i}>{part}</sub> : part,
  )
}

function shuffled(): number[][] {
  return QUESTIONS.map((q) => {
    const idx = q.options.map((_, i) => i)
    for (let i = idx.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[idx[i], idx[j]] = [idx[j], idx[i]]
    }
    return idx
  })
}

export default function Quiz() {
  const [order, setOrder] = useState(shuffled)
  const [step, setStep] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [score, setScore] = useState(0)

  const done = step >= QUESTIONS.length

  const pick = (i: number) => {
    if (picked !== null) return
    setPicked(i)
    if (i === 0) setScore((s) => s + 1)
  }
  const next = () => {
    setPicked(null)
    setStep((s) => s + 1)
  }
  const retry = () => {
    setOrder(shuffled())
    setStep(0)
    setPicked(null)
    setScore(0)
  }

  return (
    <section className="section" aria-labelledby="quiz-title">
      <h2 id="quiz-title" className="section-title">
        Quiz
      </h2>
      {done ? (
        <div className="card try-card quiz-card">
          <p className="quiz-score">
            Score: {score} / {QUESTIONS.length}
          </p>
          <button type="button" className="button primary" onClick={retry}>
            Retry
          </button>
        </div>
      ) : (
        <div className="card try-card quiz-card">
          <p className="quiz-progress">
            Question {step + 1} of {QUESTIONS.length} · score {score}
          </p>
          <fieldset className="choices">
            <legend>{sub(QUESTIONS[step].question)}</legend>
            {order[step].map((oi, k) => {
              const state = picked === null ? '' : oi === 0 ? ' correct' : picked === oi ? ' wrong' : ''
              return (
                <button
                  key={oi}
                  type="button"
                  className={`choice${state}`}
                  aria-pressed={picked === oi}
                  aria-disabled={picked !== null}
                  onClick={() => pick(oi)}
                >
                  <span className="choice-letter">{String.fromCharCode(65 + k)}</span> <span>{sub(QUESTIONS[step].options[oi])}</span>
                  {state && (
                    <span className="choice-mark" aria-hidden="true">
                      {oi === 0 ? '✓' : '✗'}
                    </span>
                  )}
                </button>
              )
            })}
          </fieldset>
          <div aria-live="polite">
            {picked !== null && (
              <p className={`feedback ${picked === 0 ? 'correct' : 'wrong'}`}>
                <strong>{picked === 0 ? 'Correct.' : 'Not quite.'}</strong> {sub(QUESTIONS[step].why)}
              </p>
            )}
          </div>
          {picked !== null && (
            <button type="button" className="button quiz-next" onClick={next}>
              {step + 1 < QUESTIONS.length ? 'Next question' : 'See score'}
            </button>
          )}
        </div>
      )}
    </section>
  )
}
