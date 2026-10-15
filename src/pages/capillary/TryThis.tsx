import { useState } from 'react'

interface Prompt {
  title: string
  task: string
  question: string
  options: string[]
  /** Index of the correct option. */
  answer: number
  why: string
}

const PROMPTS: Prompt[] = [
  {
    title: 'Pore Radius Scaling',
    task: 'Observe how reducing the pore radius impacts the pressure jump.',
    question: 'What happens to the capillary pressure (P_c) when you decrease the pore radius r?',
    options: [
      'It increases inversely, because P_c is proportional to 1/r',
      'It decreases linearly to zero',
      'It has no effect on capillary pressure',
      'It drops exponentially as pores get smaller',
    ],
    answer: 0,
    why: 'Because radius is in the denominator of the Young–Laplace equation, smaller pores generate much higher capillary pressures.',
  },
  {
    title: 'Contact Angle & Meniscus',
    task: 'Examine how surface wetting properties influence fluid behavior.',
    question: 'What defines a wetting fluid (imbibition) in terms of the contact angle θ?',
    options: [
      'θ > 90°, forming a convex bubble',
      'θ < 90°, forming a concave meniscus that rises inside the pore',
      'θ = 180°, meaning complete fluid repulsion',
      'Contact angle has no impact on pore filling',
    ],
    answer: 1,
    why: 'A contact angle below 90° means the liquid wets the solid walls, creating capillary suction.',
  },
  {
    title: 'Capillary Condensation',
    task: 'Analyze vapor behavior under nanoscale confinement.',
    question: 'Why does capillary condensation occur at relative pressures below saturation (P/P_0 < 1)?',
    options: [
      'Because the ambient temperature drops inside the pore',
      'Because the negative curvature of the confined meniscus lowers the required vapor pressure',
      'Because the gas molecules expand',
      'Because solid walls act as catalysts',
    ],
    answer: 1,
    why: 'Confinement lowers the chemical potential required for condensation, explained by the Kelvin equation.',
  },
]

function Question({ p, onSetUp }: { p: Prompt; onSetUp: () => void }) {
  const [picked, setPicked] = useState<number | null>(null)
  const right = picked === p.answer
  return (
    <li className="card try-card">
      <div className="try-head">
        <h3>{p.title}</h3>
        <button type="button" className="button" onClick={onSetUp}>
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
              <strong>Not quite.</strong> {p.why}
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

export default function TryThis({ onSetUp }: { onSetUp: () => void }) {
  return (
    <section className="section" aria-labelledby="try-title">
      <h2 id="try-title" className="section-title">
        Interactive exercises &amp; knowledge check
      </h2>
      <p className="prose">Press “Set it up”, watch, then answer.</p>
      <ol className="try-list">
        {PROMPTS.map((p) => (
          <Question key={p.title} p={p} onSetUp={onSetUp} />
        ))}
      </ol>
    </section>
  )
}
