import { useState, type ReactNode } from 'react'

// Same question card as the other tools' "Try this" sections, without a "Set it up" button.
// The first option of each question is the correct one; options are shuffled once per page load.

interface Prompt {
  title: string
  question: string
  options: string[]
  why: ReactNode
}

const PROMPTS: Prompt[] = [
  {
    title: 'Two argon atoms',
    question: 'Which interaction acts between two argon atoms?',
    options: ['London only', 'Keesom only', 'Keesom and Debye', 'All three equally'],
    why: <>Ar has no dipole (μ = 0), so C_K = C_D = 0. Only the fluctuating electron clouds attract.</>,
  },
  {
    title: 'Heating up',
    question: 'Which contribution decreases with increasing temperature?',
    options: ['Keesom', 'Debye', 'London', 'None of them'],
    why: <>Keesom ∝ 1/T: faster tumbling averages out the dipole alignment. Debye and London do not depend on T.</>,
  },
  {
    title: 'Debye',
    question: 'The Debye interaction is between…',
    options: [
      'a permanent dipole and an induced dipole',
      'two permanent dipoles',
      'two induced dipoles',
      'an ion and a permanent dipole',
    ],
    why: <>The permanent dipole polarizes its neighbour (α₀) and attracts the dipole it induced.</>,
  },
  {
    title: 'Distance',
    question: 'How do all three vdW terms scale with distance?',
    options: ['−1/r⁶', '−1/r', '−1/r³', '−1/r¹²'],
    why: <>All three give φ = −C/r⁶, so they add into a single C_vdW. Halving r makes the attraction 64× stronger.</>,
  },
  {
    title: 'HCl',
    question: 'For most molecules (e.g. HCl), the largest contribution is…',
    options: ['London', 'Keesom', 'Debye', 'They are always equal'],
    why: <>HCl: μ = 1.08 D is modest but α = 2.63 Å³ is large, so London gives about 86 %. Load HCl above to check.</>,
  },
  {
    title: 'Water',
    question: 'For H₂O, the largest contribution is…',
    options: ['Keesom', 'London', 'Debye', 'None: water has no vdW forces'],
    why: <>Water has a large dipole (1.85 D) and a small polarizability (1.48 Å³): Keesom gives about 69 % at 293 K.</>,
  },
  {
    title: 'Origin of London forces',
    question: 'London forces originate from…',
    options: [
      'instantaneous fluctuations of the electron cloud',
      'permanent dipoles lining up',
      'net charges on the molecules',
      'hydrogen bonds between molecules',
    ],
    why: <>At any instant the electrons are off-centre. That brief dipole induces one in the neighbour, and they attract.</>,
  },
  {
    title: 'Liquid hydrogen',
    question: 'Why is H₂ so hard to liquefy?',
    options: [
      'Small polarizability, so only weak London forces',
      'Its strong dipole makes molecules repel',
      'Keesom forces are too strong at low T',
      'H₂ molecules are charged',
    ],
    why: <>H₂ is nonpolar with α = 0.80 Å³, so only a weak London term holds it together. It boils at about 20 K.</>,
  },
]

function shuffled<T>(xs: T[]): T[] {
  const a = [...xs]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function Question({ p }: { p: Prompt }) {
  const [options] = useState(() => shuffled(p.options))
  const [picked, setPicked] = useState<number | null>(null)
  const answer = options.indexOf(p.options[0])
  const right = picked === answer
  return (
    <li className="card try-card">
      <div className="try-head">
        <h3>{p.title}</h3>
      </div>
      <fieldset className="choices">
        <legend>{p.question}</legend>
        {options.map((o, i) => (
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

export default function Quiz() {
  return (
    <section className="section" aria-labelledby="quiz-title">
      <h2 id="quiz-title" className="section-title">
        Quiz
      </h2>
      <ol className="try-list">
        {PROMPTS.map((p) => (
          <Question key={p.title} p={p} />
        ))}
      </ol>
    </section>
  )
}
