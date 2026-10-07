import type { ReactNode } from 'react'
import type { View } from './insight'

export interface Preset {
  view?: View
  x?: number
  K?: number
  c?: number
  yRange?: 'ml' | 'full'
  /** Section to scroll to after applying. */
  target: 'sim-figure' | 'bet-plot'
}

interface Prompt {
  title: string
  task: ReactNode
  why: ReactNode
  preset: Preset
}

const PROMPTS: Prompt[] = [
  {
    title: 'Find the knee',
    task: 'Slowly drag p/p₀ from 0 up to 0.3 and watch layer 1 (darkest). Where does the curve bend?',
    why: (
      <>
        Near point B, at p/p₀ = 1/(1 + √C) ≈ 0.12 for C = 50. Before B almost every new molecule lands on bare
        solid, which binds it strongly, so V rises fast. After B the first layer is nearly full; new molecules must
        sit on other molecules, which hold them only as strongly as a liquid does, so the slope drops. That bend
        is the knee, and the amount adsorbed there is roughly the monolayer capacity Vₘ.
      </>
    ),
    preset: { view: 'bet', x: 0.02, c: 50, yRange: 'ml', target: 'sim-figure' },
  },
  {
    title: 'Make the knee disappear',
    task: 'C is now 1. Move the C slider between 1 and 100 and watch the shape of the curve.',
    why: (
      <>
        C ≈ exp[(E₁ − E<sub>L</sub>)/RT]. With C below 2 the solid binds the first layer no more strongly than the
        liquid binds itself, so molecules pile up in islands instead of completing a monolayer first. The isotherm
        turns convex (IUPAC type III, e.g. water on a hydrophobic carbon). No knee means no point B, so Vₘ from
        BET becomes unreliable.
      </>
    ),
    preset: { view: 'bet', x: 0.3, c: 1, yRange: 'ml', target: 'sim-figure' },
  },
  {
    title: 'Same pressure, two models',
    task: 'Both surfaces now run side by side with K = C = 50 at p/p₀ = 0.8. Compare them, then drag p/p₀ down to 0.05.',
    why: (
      <>
        At 0.8 Langmuir sits on its plateau (θ ≈ 0.98: every site taken once), while BET holds about 5 layers’
        worth, because molecules land on molecules and the gas starts to condense. At 0.05 the two nearly agree
        (0.71 vs 0.76): at low pressure almost everything is still in the first layer, and BET behaves like
        Langmuir.
      </>
    ),
    preset: { view: 'both', x: 0.8, K: 50, c: 50, yRange: 'full', target: 'sim-figure' },
  },
  {
    title: 'Strong vs weak binding',
    task: 'Langmuir with K = 200 at p/p₀ = 0.1. Watch the surface, then drag K down to 1.',
    why: (
      <>
        θ drops from 0.95 to 0.09. K is the ratio of the adsorption and desorption rate constants: a strongly bound
        molecule rarely leaves, so the surface is full even at low pressure. This is why a few ppm of CO, which
        binds to Pt far more strongly than H₂, can poison a fuel-cell anode.
      </>
    ),
    preset: { view: 'langmuir', x: 0.1, K: 200, target: 'sim-figure' },
  },
  {
    title: 'Surface area does not depend on C',
    task: 'In the BET plot below, move C from 10 to 300 and watch the slope, the intercept, Vₘ and the surface area.',
    why: (
      <>
        Slope and intercept both change, but Vₘ = 1/(slope + intercept), and with it the area, stays the same. Vₘ
        belongs to the solid (how much surface there is), C to the gas–solid pair (how strongly the first layer
        binds). The straight-line plot separates the two.
      </>
    ),
    preset: { view: 'bet', c: 10, target: 'bet-plot' },
  },
]

export default function TryThis({ onApply }: { onApply: (p: Preset) => void }) {
  return (
    <section className="section" aria-labelledby="try-title">
      <h2 id="try-title" className="section-title">
        Try this
      </h2>
      <p className="prose">
        Each button sets up the simulation for one question. Predict the answer before you look at the
        explanation.
      </p>
      <ol className="try-list">
        {PROMPTS.map((p) => (
          <li key={p.title} className="card try-card">
            <div className="try-head">
              <h3>{p.title}</h3>
              <button type="button" className="button" onClick={() => onApply(p.preset)}>
                Set it up
              </button>
            </div>
            <p>{p.task}</p>
            <details>
              <summary>What’s going on?</summary>
              <p>{p.why}</p>
            </details>
          </li>
        ))}
      </ol>
    </section>
  )
}
