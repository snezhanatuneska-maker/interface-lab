import { useState, type ReactNode } from 'react'
import type { LiquidId } from '../../lib/capillary'

export interface Preset {
  liquid?: LiquidId
  r?: number
  theta?: number
  /** Section to scroll to after applying. */
  target: 'sim-figure' | 'cond-plot'
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
    title: 'Shrink the pore',
    task: 'r is now 100 nm. Drag it down to 1 nm and watch P_c.',
    question: 'What happens to the capillary pressure?',
    options: [
      'It drops toward zero',
      'It grows 100-fold, because P_c ∝ 1/r',
      'It stays the same; only θ matters',
      'It grows 10-fold, because P_c ∝ 1/√r',
    ],
    answer: 1,
    why: (
      <>
        r is in the denominator of eq. (1): 1.25 MPa at 100 nm, 125 MPa at 1 nm. On the log–log plot that is a straight
        line of slope −1.
      </>
    ),
    preset: { r: 100, theta: 30, target: 'sim-figure' },
  },
  {
    title: 'Cross 90°',
    task: 'Drag θ slowly from 30° to 150°. Watch the meniscus and the sign of P_c.',
    question: 'What changes when θ goes above 90°?',
    options: [
      'Nothing; the liquid still rises, only more slowly',
      'The liquid freezes in the pore',
      'The meniscus bulges up, P_c turns negative and the liquid must be pushed in',
      'The pore radius shrinks',
    ],
    answer: 2,
    why: (
      <>
        cos θ changes sign at 90°. A non-wetting wall (PTFE, or any solid with mercury) pushes the liquid out: it
        enters only above a breakthrough pressure |P<sub>c</sub>|.
      </>
    ),
    preset: { r: 10, theta: 30, target: 'sim-figure' },
  },
  {
    title: 'Condensation below p₀',
    task: 'r = 3 nm, θ = 0°. Read off where the pore fills in Figure 2.',
    question: 'Why does water condense in the pore below saturation (p/p₀ < 1)?',
    options: [
      'The pore is colder than the gas',
      'The concave meniscus lowers the vapour pressure the liquid needs to be stable',
      'The gas is compressed by the walls',
      'The walls react with the vapour',
    ],
    answer: 1,
    why: (
      <>
        Over a concave surface the liquid is at lower pressure, so it is in equilibrium with less vapour (eq. 3). At
        r = 3 nm the pore fills at p/p₀ ≈ 0.84.
      </>
    ),
    preset: { r: 3, theta: 0, target: 'cond-plot' },
  },
  {
    title: 'The hysteresis loop',
    task: 'r = 5 nm. Compare where the pore fills and where it empties.',
    question: 'Why does it empty at a lower p/p₀ than it fills?',
    options: [
      'Some liquid evaporates on the way',
      'Emptying is slower, so it lags behind',
      'Filling starts from a cylindrical film (curvature 1/r), emptying from a hemispherical meniscus (2/r)',
      'The contact angle is 90° on the way out',
    ],
    answer: 2,
    why: (
      <>
        The emptying meniscus is twice as curved, so in eq. (4) the exponent doubles: p/p₀ ≈ 0.81 out vs 0.90 in. This
        is the type IV hysteresis loop of the adsorption lab.
      </>
    ),
    preset: { r: 5, theta: 0, target: 'cond-plot' },
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
      <p className="prose">Press “Set it up”, watch, then answer.</p>
      <ol className="try-list">
        {PROMPTS.map((p) => (
          <Question key={p.title} p={p} onApply={onApply} />
        ))}
      </ol>
    </section>
  )
}
