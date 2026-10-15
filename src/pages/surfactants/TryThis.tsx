import { useState, type ReactNode } from 'react'
import type { HeadType, SurfactantId } from '../../lib/surfactants'

export interface Preset {
  surf: SurfactantId
  head?: HeadType
  tail?: number
  saltMM?: number
  /** log10 of the concentration in M. */
  logC: number
  /** Scroll to the conductivity plot instead of the main simulation. */
  showConductivity?: boolean
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
    title: 'Ionic vs non-ionic',
    task: 'SDS is set at 1 mM. Note the CMC, then switch the surfactant to Tween 20 and watch the CMC line move.',
    question: 'Why does the CMC drop by about two orders of magnitude (8.2 mM → 0.06 mM)?',
    options: [
      'Tween 20 has a much longer tail',
      'Tween 20 heads carry no charge, so they do not repel each other in a micelle',
      'Tween 20 lowers the surface tension of water more',
      'Non-ionic surfactants do not adsorb at the surface',
    ],
    answer: 1,
    why: (
      <>
        Both have a C12 tail. Packing SDS heads into a micelle brings negative charges close together, and that
        repulsion has to be paid for, so more surfactant is needed before micelles pay off. Tween 20 heads are
        uncharged: no repulsion, a much lower CMC. Note that at 1 mM Tween 20 is already far above its CMC.
      </>
    ),
    preset: { surf: 'sds', logC: -3 },
  },
  {
    title: 'One more carbon',
    task: 'Custom anionic surfactant with a C12 tail. Move the tail length to 13, then 14, and read the CMC.',
    question: 'What does each extra CH₂ do to the CMC of an ionic surfactant?',
    options: ['Doubles it', 'Roughly halves it', 'Divides it by 10', 'Nothing measurable'],
    answer: 1,
    why: (
      <>
        Klevens: log₁₀ CMC = A − 0.3·n, and 10<sup>−0.3</sup> ≈ 0.5. Each CH₂ makes leaving the water more
        favourable, so micelles form at about half the concentration. For non-ionics (B ≈ 0.5) the factor is about 3.
      </>
    ),
    preset: { surf: 'custom', head: 'anionic', tail: 12, logC: -2.5 },
  },
  {
    title: 'Add salt',
    task: 'SDS without salt. Slide NaCl up to 100 mM and watch the CMC line. Then switch to Tween 20 and try again.',
    question: 'Why does salt lower the CMC of SDS but not of Tween 20?',
    options: [
      'Salt makes the tails longer',
      'Salt ions screen the repulsion between the charged SDS heads; Tween heads have no charge to screen',
      'Salt raises the surface tension, which forces micelles to form',
      'Salt reacts with SDS to form a new surfactant',
    ],
    answer: 1,
    why: (
      <>
        Na⁺ ions gather around the negative sulfate heads and shield them from each other, removing part of the
        penalty for packing them into a micelle. At 100 mM NaCl the SDS CMC falls from 8.2 mM to about 1.6 mM.
        Tween's heads are uncharged, so there is nothing to screen: the salt slider disappears.
      </>
    ),
    preset: { surf: 'sds', saltMM: 0, logC: -2.3 },
  },
  {
    title: 'Read the conductivity break',
    task: 'SDS at 3 mM. Move the concentration slider through the CMC while watching the conductivity plot.',
    question: 'Why does the conductivity rise more slowly above the CMC?',
    options: [
      'The surfactant stops dissolving',
      'Micelles bind part of their counterions (β ≈ 0.64), and the micelles themselves move slowly',
      'The solution becomes turbid, which blocks the current',
      'Surface tension no longer changes',
    ],
    answer: 1,
    why: (
      <>
        Below the CMC each molecule adds a free Na⁺ and a free DS⁻ ion. Above it, new molecules join micelles that
        hold on to about 64 % of their Na⁺, so each one adds fewer free charge carriers: β = 1 − S<sub>above</sub>/S
        <sub>below</sub>. For Tween 20 there is no break at all: it is not ionic.
      </>
    ),
    preset: { surf: 'sds', logC: -2.52, showConductivity: true },
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

export default function TryThis({ onApply }: { onApply: (p: Preset) => void }) {
  return (
    <section className="section" aria-labelledby="try-title">
      <h2 id="try-title" className="section-title">
        Try this
      </h2>
      <p className="prose">Press “Set it up”, follow the task, then answer.</p>
      <ol className="try-list">
        {PROMPTS.map((p) => (
          <Question key={p.title} p={p} onApply={onApply} />
        ))}
      </ol>
    </section>
  )
}
