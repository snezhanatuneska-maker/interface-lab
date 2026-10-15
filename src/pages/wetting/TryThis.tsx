import { useState, type ReactNode } from 'react'
import type { InputMode } from '../../lib/wetting'
import type { Surface } from './DropView'

// Same layout as the adsorption page's "Try this": each card sets up the simulation, then asks one question.
// The numeric answers (59°, 121°, 159°) are checked against the model in src/lib/wetting.test.ts.

export interface Setup {
  mode?: InputMode
  thetaY?: number
  r?: number
  fs?: number
  view?: Surface
}

interface Prompt {
  title: string
  task: ReactNode
  question: ReactNode
  options: ReactNode[]
  /** Index of the correct option. */
  answer: number
  why: ReactNode
  setup: Setup
}

const Y = <>θ<sub>Y</sub></>

const PROMPTS: Prompt[] = [
  {
    title: 'Balance at the contact line',
    task: (
      <>
        Young view, surface tensions. Raise γ<sub>SL</sub> and watch the drop.
      </>
    ),
    question: <>Young’s equation balances which three interfacial tensions?</>,
    options: [
      <>Only γ<sub>LV</sub> and gravity</>,
      <>γ<sub>SV</sub>, γ<sub>SL</sub> and γ<sub>LV</sub></>,
      <>γ<sub>SV</sub> and γ<sub>LV</sub> only</>,
      <>Viscosity, density and γ<sub>LV</sub></>,
    ],
    answer: 1,
    why: 'Solid–vapor, solid–liquid and liquid–vapor tensions balance along the surface at the contact line.',
    setup: { mode: 'tension', view: 'smooth' },
  },
  {
    title: 'Roughen a hydrophilic surface',
    task: <>{Y} = 70°, r = 1.5. Switch between Young and Wenzel.</>,
    question: <>A surface has {Y} = 70°. It is roughened to r = 1.5 (Wenzel state). The apparent angle becomes…</>,
    options: ['About 80°', 'Unchanged at 70°', 'About 59°, more hydrophilic', 'About 105°'],
    answer: 2,
    why: (
      <>
        cos θ<sub>W</sub> = 1.5 × cos 70° = 0.51, so θ<sub>W</sub> ≈ 59°. Below 90°, roughness makes the surface wet
        even more.
      </>
    ),
    setup: { mode: 'angle', thetaY: 70, r: 1.5, view: 'smooth' },
  },
  {
    title: 'Roughen a hydrophobic surface',
    task: <>Same r = 1.5, now {Y} = 110°. Switch between Young and Wenzel.</>,
    question: <>Same roughness r = 1.5, but {Y} = 110°. The Wenzel angle is…</>,
    options: ['About 121°, more hydrophobic', 'About 99°, less hydrophobic', 'Unchanged at 110°', 'About 59°'],
    answer: 0,
    why: (
      <>
        cos θ<sub>W</sub> = 1.5 × cos 110° = −0.51, so θ<sub>W</sub> ≈ 121°. Above 90°, roughness makes the surface
        repel more.
      </>
    ),
    setup: { mode: 'angle', thetaY: 110, r: 1.5, view: 'smooth' },
  },
  {
    title: 'What is under the drop?',
    task: 'Cassie–Baxter view. Look at the zoom under the drop.',
    question: 'In the Cassie–Baxter state the droplet…',
    options: [
      'Fills all the grooves',
      'Spreads into a film',
      'Dissolves into the solid',
      'Rests partly on air trapped in the surface texture',
    ],
    answer: 3,
    why: (
      <>
        The drop touches only the tops of the texture (fraction f<sub>s</sub>); the rest of its base sits on air.
      </>
    ),
    setup: { mode: 'angle', thetaY: 110, r: 2, fs: 0.3, view: 'cassie' },
  },
  {
    title: 'Reach superhydrophobic',
    task: (
      <>
        {Y} = 110°. Drag f<sub>s</sub> from 1 down to 0.1.
      </>
    ),
    question: (
      <>
        {Y} = 110°, f<sub>s</sub> = 0.1. The Cassie–Baxter angle is approximately…
      </>
    ),
    options: ['About 121°', 'About 159° (superhydrophobic)', 'About 110°', 'About 180°'],
    answer: 1,
    why: (
      <>
        cos θ<sub>CB</sub> = 0.1 × (cos 110° + 1) − 1 = −0.93, so θ<sub>CB</sub> ≈ 159°, above 150°.
      </>
    ),
    setup: { mode: 'angle', thetaY: 110, r: 3, fs: 1, view: 'cassie' },
  },
  {
    title: 'What roughness does',
    task: <>Wenzel view, {Y} = 60°. Drag r from 1 to 3. Then set {Y} = 120° and do it again.</>,
    question: 'What does Wenzel’s equation say roughness does?',
    options: [
      'Makes every surface more hydrophobic',
      'Makes every surface more hydrophilic',
      'Amplifies the surface’s existing wetting tendency',
      'Has no effect on the contact angle',
    ],
    answer: 2,
    why: (
      <>
        cos θ<sub>W</sub> = r cos θ<sub>Y</sub> with r ≥ 1: the cosine keeps its sign and grows, so below 90° goes
        lower, above 90° goes higher.
      </>
    ),
    setup: { mode: 'angle', thetaY: 60, r: 1, view: 'wenzel' },
  },
  {
    title: 'Sticky or rolling',
    task: 'Lotus leaf. Switch between Wenzel and Cassie–Baxter and compare what is under the drop.',
    question: 'Why does a drop roll off a lotus leaf but stick on a rough Wenzel surface?',
    options: [
      'In Cassie–Baxter it touches little solid, so it is weakly pinned',
      'The lotus leaf is perfectly smooth',
      'The Wenzel drop has a higher contact angle',
      'Gravity is stronger on the lotus leaf',
    ],
    answer: 0,
    why: 'A Wenzel drop fills the grooves and is pinned in them; a Cassie–Baxter drop rests mostly on air.',
    setup: { mode: 'angle', thetaY: 110, r: 3, fs: 0.1, view: 'wenzel' },
  },
  {
    title: 'Fuel-cell gas diffusion layer',
    task: <>Teflon/PTFE: {Y} = 110° on rough carbon paper, r = 1.5. Look at the Wenzel drop.</>,
    question: 'Why is the gas diffusion layer in a PEM fuel cell treated with PTFE?',
    options: [
      'To make it hydrophilic so water spreads through it',
      'To raise its electrical conductivity',
      'To make the catalyst more active',
      'To make it hydrophobic so liquid water is expelled and pores don’t flood',
    ],
    answer: 3,
    why: (
      <>
        PTFE raises {Y} above 90°; on the rough carbon paper Wenzel makes it repel water even more, keeping gas paths
        open.
      </>
    ),
    setup: { mode: 'angle', thetaY: 110, r: 1.5, fs: 0.6, view: 'wenzel' },
  },
]

function Question({ p, onApply }: { p: Prompt; onApply: (s: Setup) => void }) {
  const [picked, setPicked] = useState<number | null>(null)
  const right = picked === p.answer
  return (
    <li className="card try-card">
      <div className="try-head">
        <h3>{p.title}</h3>
        <button type="button" className="button" onClick={() => onApply(p.setup)}>
          Set it up
        </button>
      </div>
      <p>{p.task}</p>
      <fieldset className="choices">
        <legend>{p.question}</legend>
        {p.options.map((o, i) => (
          <button
            key={i}
            type="button"
            className={`choice${picked === i ? (right ? ' correct' : ' wrong') : ''}`}
            aria-pressed={picked === i}
            onClick={() => setPicked(i)}
          >
            <span className="choice-letter">{String.fromCharCode(65 + i)}</span> <span>{o}</span>
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

export default function TryThis({ onApply }: { onApply: (s: Setup) => void }) {
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
