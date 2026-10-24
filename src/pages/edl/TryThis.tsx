import { useState, type ReactNode } from 'react'
import type { Model } from '../../lib/edl'

export interface Preset {
  model?: Model
  c0?: number
  z?: number
  psi0?: number
  delta?: number
}

interface Prompt {
  title: string
  task: ReactNode
  /** What to look for, shown once the preset has been applied. */
  see: ReactNode
  preset: Preset
}

const PROMPTS: Prompt[] = [
  {
    title: 'Add salt',
    task: 'c₀ is set to 1 mM. Drag it up to 100 mM and watch κ⁻¹ and the potential curve.',
    see: (
      <>
        κ⁻¹ falls from 9.6 nm to 0.96 nm: 100× more salt, 10× thinner layer (κ⁻¹ ∝ 1/√I). The ion clouds hug the
        surface.
      </>
    ),
    preset: { model: 'gc', c0: 1, z: 1, psi0: 75 },
  },
  {
    title: 'Change the valency',
    task: 'Switch z from 1:1 to 2:2 at the same 10 mM.',
    see: (
      <>
        I = c₀z² goes up 4×, so κ⁻¹ halves (3.0 → 1.5 nm). The counter-ion peak at the surface also grows, since the
        Boltzmann factor is exp(zeψ/kT).
      </>
    ),
    preset: { model: 'gc', c0: 10, z: 1, psi0: 75 },
  },
  {
    title: 'Break Gouy–Chapman',
    task: 'Gouy–Chapman, ψ₀ = 200 mV. Read C_tot, then switch the model to Gouy–Chapman–Stern.',
    see: (
      <>
        GC gives ~560 µF/cm², far above anything measured. With the Stern layer C_tot drops below C_Stern (17.7
        µF/cm²): in series, the smaller capacitor wins.
      </>
    ),
    preset: { model: 'gc', c0: 10, z: 1, psi0: 200, delta: 0.5 },
  },
]

function Card({ p, onApply }: { p: Prompt; onApply: (p: Preset) => void }) {
  const [applied, setApplied] = useState(false)
  return (
    <li className="card try-card">
      <div className="try-head">
        <h3>{p.title}</h3>
        <button
          type="button"
          className="button"
          onClick={() => {
            onApply(p.preset)
            setApplied(true)
          }}
        >
          Set it up
        </button>
      </div>
      <p>{p.task}</p>
      <div aria-live="polite">
        {applied && (
          <p className="feedback correct">
            <strong>What to notice:</strong> {p.see}
          </p>
        )}
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
      <p className="prose">Press “Set it up”, make the change, then compare with the note.</p>
      <ol className="try-list">
        {PROMPTS.map((p) => (
          <Card key={p.title} p={p} onApply={onApply} />
        ))}
      </ol>
    </section>
  )
}
