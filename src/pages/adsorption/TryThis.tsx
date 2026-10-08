import { useState, type ReactNode } from 'react'
import type { Model } from '../../lib/adsorption'

export interface Preset {
  mode?: Model
  x?: number
  K?: number
  c?: number
  /** Section to scroll to after applying. */
  target: 'sim-figure' | 'bet-plot'
}

interface Prompt {
  title: string
  task: ReactNode
  question: string
  options: string[]
  /** Index of the correct option. */
  answer: number
  why: ReactNode
  preset: Preset
}

const PROMPTS: Prompt[] = [
  {
    title: 'Find the knee',
    task: 'Drag p/p₀ slowly from 0 to 0.3. Watch layer 1.',
    question: 'Where does the BET curve bend?',
    options: [
      'At p/p₀ ≈ 0.12, at one monolayer’s worth',
      'At p/p₀ = 0.35, the end of the BET fit range',
      'At p/p₀ = 0.5, half the saturation pressure',
      'It does not bend; it rises steadily',
    ],
    answer: 0,
    why: (
      <>
        B is at p/p₀ = 1/(1 + √C) ≈ 0.12 for C = 50. Before B, molecules land on bare solid and bind strongly. After
        B they land on other molecules, which hold them weakly, so the curve flattens.
      </>
    ),
    preset: { mode: 'bet', x: 0.02, c: 50, target: 'sim-figure' },
  },
  {
    title: 'Make the knee disappear',
    task: 'C is now 1. Move C between 1 and 100 and watch the curve.',
    question: 'What happens to the curve when C is below 2?',
    options: [
      'The knee becomes sharper',
      'The knee disappears; the curve bends up from the start',
      'It levels off at one monolayer, like Langmuir',
      'Nothing; C only changes the surface area',
    ],
    answer: 1,
    why: (
      <>
        Below C = 2 the solid holds the first layer barely better than the liquid holds itself, so molecules pile up
        in islands (type III). No knee, no point B: V<sub>m</sub> is unreliable.
      </>
    ),
    preset: { mode: 'bet', x: 0.3, c: 1, target: 'sim-figure' },
  },
  {
    title: 'Same pressure, two models',
    task: 'BET, C = 50, p/p₀ = 0.8. Note the loading, then switch to Langmuir (K = 50).',
    question: 'Why is the Langmuir loading so much lower?',
    options: [
      'Langmuir molecules bind more weakly',
      'The Langmuir surface has fewer sites',
      'Langmuir allows one molecule per site, so it stops at one layer',
      'Langmuir is only valid below p/p₀ = 0.35',
    ],
    answer: 2,
    why: (
      <>
        BET holds about 5 layers at 0.8. Langmuir is on its plateau, θ ≈ 0.98. At p/p₀ = 0.05 they nearly agree (0.71
        vs 0.76): almost everything is still in layer 1.
      </>
    ),
    preset: { mode: 'bet', x: 0.8, K: 50, c: 50, target: 'sim-figure' },
  },
  {
    title: 'Strong vs weak binding',
    task: 'Langmuir, K = 200, p/p₀ = 0.1. Now drag K down to 1.',
    question: 'What happens to the coverage θ?',
    options: [
      'It stays the same; the pressure did not change',
      'It rises; weaker binding frees sites',
      'It drops to exactly 0.5',
      'It drops from about 0.95 to about 0.09',
    ],
    answer: 3,
    why: (
      <>
        A strongly bound molecule rarely leaves, so the surface fills even at low pressure. That is why a few ppm of
        CO can poison a Pt fuel-cell anode.
      </>
    ),
    preset: { mode: 'langmuir', x: 0.1, K: 200, target: 'sim-figure' },
  },
  {
    title: 'Surface area and C',
    task: (
      <>
        In the BET plot below, move C from 10 to 300. Watch V<sub>m</sub> and the area.
      </>
    ),
    question: 'What happens to the specific surface area in m²/g?',
    options: ['It grows with C', 'It stays the same', 'It shrinks with C', 'It cannot be calculated once C > 100'],
    answer: 1,
    why: (
      <>
        Slope and intercept change, but V<sub>m</sub> = 1/(slope + intercept) does not. V<sub>m</sub> belongs to the solid, C to how
        strongly the gas binds to it.
      </>
    ),
    preset: { mode: 'bet', c: 10, target: 'bet-plot' },
  },
]

function Question({ p, onApply }: { p: Prompt; onApply: (p: Preset) => void }) {
  const [picked, setPicked] = useState<number | null>(null)
  const right = picked === p.answer
  return (
    <li className="card try-card">
      <div className="try-head">
        <h3>{p.title}</h3>
        <button type="button" className="button" onClick={() => onApply(p.preset)}>
          Set it up
        </button>
      </div>
      <p>{p.task}</p>
      <fieldset className="choices">
        <legend>{p.question}</legend>
        {p.options.map((o, i) => (
          <button
            key={o}
            type="button"
            className={`choice${picked === i ? (right ? ' correct' : ' wrong') : ''}`}
            aria-pressed={picked === i}
            onClick={() => setPicked(i)}
          >
            <span className="choice-letter">{String.fromCharCode(65 + i)}</span> {o}
            {picked === i && (
              <span className="choice-mark" aria-hidden="true">
                {right ? '✓' : '✗'}
              </span>
            )}
          </button>
        ))}
      </fieldset>
      <div aria-live="polite">
        {picked !== null &&
          (right ? (
            <p className="feedback correct">
              <strong>Correct.</strong> {p.why}
            </p>
          ) : (
            <p className="feedback wrong">
              <strong>Not quite.</strong> Try again.
            </p>
          ))}
      </div>
      {picked !== null && (
        <button type="button" className="link-button" onClick={() => setPicked(null)}>
          Reset
        </button>
      )}
    </li>
  )
}

export default function TryThis({ onApply }: { onApply: (p: Preset) => void }) {
  return (
    <section className="section" aria-labelledby="try-title">
      <h2 id="try-title" className="section-title">
        Try this
      </h2>
      <p className="prose">
        Press “Set it up”, watch, then answer.
      </p>
      <ol className="try-list">
        {PROMPTS.map((p) => (
          <Question key={p.title} p={p} onApply={onApply} />
        ))}
      </ol>
    </section>
  )
}
