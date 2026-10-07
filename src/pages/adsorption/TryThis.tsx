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
    task: 'Slowly drag p/p₀ from 0 up to 0.3 and watch layer 1 (on the solid).',
    question: 'Where does the BET curve bend?',
    options: [
      'At p/p₀ ≈ 0.12, when about one monolayer’s worth is adsorbed',
      'At p/p₀ = 0.35, the end of the BET fit range',
      'At p/p₀ = 0.5, half the saturation pressure',
      'It does not bend; it rises steadily',
    ],
    answer: 0,
    why: (
      <>
        Point B sits at p/p₀ = 1/(1 + √C) ≈ 0.12 for C = 50. Before B almost every new molecule lands on bare solid,
        which binds it strongly, so V rises fast. After B the first layer is nearly full; new molecules must sit on
        other molecules, which hold them only as strongly as a liquid does, so the slope drops.
      </>
    ),
    preset: { mode: 'bet', x: 0.02, c: 50, target: 'sim-figure' },
  },
  {
    title: 'Make the knee disappear',
    task: 'C is now 1. Move the C slider between 1 and 100 and watch the shape of the curve.',
    question: 'What happens to the curve when C is below 2?',
    options: [
      'The knee becomes sharper',
      'The knee disappears and the curve bends upward from the start',
      'The curve levels off at one monolayer, like Langmuir',
      'Nothing; C only changes the surface area',
    ],
    answer: 1,
    why: (
      <>
        C ≈ exp[(E₁ − E<sub>L</sub>)/RT]. Below 2 the solid binds the first layer no more strongly than the liquid
        binds itself, so molecules pile up in islands instead of completing a monolayer first. The curve turns
        convex (IUPAC type III). No knee means no point B, so Vₘ from BET becomes unreliable.
      </>
    ),
    preset: { mode: 'bet', x: 0.3, c: 1, target: 'sim-figure' },
  },
  {
    title: 'Same pressure, two models',
    task: 'BET with C = 50 at p/p₀ = 0.8. Note the loading, then switch the model to Langmuir (K = 50; the pressure stays).',
    question: 'Why is the Langmuir loading so much lower?',
    options: [
      'Langmuir molecules bind more weakly',
      'The Langmuir surface has fewer sites',
      'Langmuir allows only one molecule per site, so it stops at one monolayer',
      'Langmuir is only valid below p/p₀ = 0.35',
    ],
    answer: 2,
    why: (
      <>
        BET holds about 5 layers’ worth at 0.8, because molecules land on molecules and the gas starts to condense.
        Langmuir sits on its plateau, θ ≈ 0.98: every site taken once, and nowhere else to go. At p/p₀ = 0.05 the two
        nearly agree (0.71 vs 0.76), because almost everything is still in the first layer.
      </>
    ),
    preset: { mode: 'bet', x: 0.8, K: 50, c: 50, target: 'sim-figure' },
  },
  {
    title: 'Strong vs weak binding',
    task: 'Langmuir with K = 200 at p/p₀ = 0.1. Watch the surface, then drag K down to 1.',
    question: 'What happens to the coverage θ?',
    options: [
      'It stays the same, because the pressure did not change',
      'It rises, because weaker binding frees sites for more molecules',
      'It drops to exactly 0.5',
      'It drops from about 0.95 to about 0.09',
    ],
    answer: 3,
    why: (
      <>
        K is the ratio of the adsorption and desorption rate constants: a strongly bound molecule rarely leaves, so
        the surface is full even at low pressure. This is why a few ppm of CO, which binds to Pt far more strongly
        than H₂, can poison a fuel-cell anode.
      </>
    ),
    preset: { mode: 'langmuir', x: 0.1, K: 200, target: 'sim-figure' },
  },
  {
    title: 'Surface area and C',
    task: 'In the BET plot below, move C from 10 to 300 and watch the slope, the intercept, Vₘ and the area.',
    question: 'What happens to the specific surface area in m²/g?',
    options: ['It grows with C', 'It stays the same', 'It shrinks with C', 'It cannot be calculated once C > 100'],
    answer: 1,
    why: (
      <>
        Slope and intercept both change, but Vₘ = 1/(slope + intercept), and with it the area, stays the same. Vₘ
        belongs to the solid (how much surface there is), C to the gas–solid pair (how strongly the first layer
        binds). The straight-line plot separates the two.
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
              <strong>Not quite.</strong> Try the simulation again and pick another answer.
            </p>
          ))}
      </div>
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
        Each “Set it up” button prepares the simulation for one question. Run it, then pick an answer.
      </p>
      <ol className="try-list">
        {PROMPTS.map((p) => (
          <Question key={p.title} p={p} onApply={onApply} />
        ))}
      </ol>
    </section>
  )
}
