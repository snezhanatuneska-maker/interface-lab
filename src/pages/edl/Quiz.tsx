import KnowledgeCheck, { type CheckQuestion } from '../../components/KnowledgeCheck'

const QUESTIONS: CheckQuestion[] = [
  {
    id: 1,
    title: 'More salt',
    description: 'Move the concentration slider and watch κ⁻¹.',
    prompt: 'Increasing the electrolyte concentration makes the Debye length…',
    options: ['A. longer', 'B. shorter', 'C. unchanged', 'D. zero above 100 mM'],
    correct: 1,
    explanation: 'κ⁻¹ ∝ 1/√I, so more ions screen the surface over a shorter distance.',
  },
  {
    id: 2,
    title: 'A number to remember',
    description: 'Set a 1:1 salt at 10 mM and read κ⁻¹.',
    prompt: 'For a 1:1 electrolyte at 25 °C, 10 mM gives a Debye length of about…',
    options: ['A. 0.3 nm', 'B. 3 nm', 'C. 30 nm', 'D. 300 nm'],
    correct: 1,
    explanation: 'κ⁻¹ = 0.304/√I nm with I in mol/L: 0.304/√0.01 ≈ 3.0 nm.',
  },
  {
    id: 3,
    title: 'The flaw in Gouy–Chapman',
    description: 'Push ψ₀ high in Gouy–Chapman mode and look at the ion profile near x = 0.',
    prompt: 'What is the main physical flaw of the Gouy–Chapman model?',
    options: [
      'A. It ignores thermal motion of the ions',
      'B. It treats ions as point charges, so they can approach the surface infinitely closely',
      'C. It assumes the potential is constant everywhere',
      'D. It only works for 2:2 electrolytes',
    ],
    correct: 1,
    explanation:
      'Point charges can pile up right at the surface, which gives absurd concentrations and capacitances at high potential.',
  },
  {
    id: 4,
    title: 'Capacitors in series',
    description: 'Compare the two curves in the capacitance plot at 200 mV.',
    prompt: 'Why does the Stern model predict a lower total capacitance than Gouy–Chapman at high potential?',
    options: [
      'A. The Stern layer adds extra charge',
      'B. The diffuse layer disappears',
      'C. Stern and diffuse capacitances are in series, so the smaller Stern capacitance limits C_tot',
      'D. The permittivity of water rises near the surface',
    ],
    correct: 2,
    explanation: '1/C_tot = 1/C_Stern + 1/C_diffuse. As C_diffuse grows, C_tot levels off just below C_Stern.',
  },
  {
    id: 5,
    title: 'Higher valency',
    description: 'Switch between 1:1 and 2:2 at the same c₀.',
    prompt: 'Switching from a 1:1 to a 2:2 electrolyte at the same concentration…',
    options: [
      'A. expands the double layer',
      'B. has no effect, since c₀ is the same',
      'C. compresses the double layer',
      'D. reverses the sign of the surface potential',
    ],
    correct: 2,
    explanation: 'I = c₀z² is 4× larger, so κ⁻¹ halves.',
  },
  {
    id: 6,
    title: 'Who is enriched?',
    description: 'The simulator uses a positive surface; think about the mirror case.',
    prompt: 'In the diffuse layer near a negatively charged surface…',
    options: [
      'A. cations are enriched and anions depleted relative to the bulk',
      'B. anions are enriched and cations depleted',
      'C. both are enriched',
      'D. both stay at the bulk concentration',
    ],
    correct: 0,
    explanation: 'Cations are the counter-ions here: c₊ = c₀ exp(−zeψ/kT) > c₀ when ψ < 0, while anions are pushed away.',
  },
]

export default function Quiz() {
  return <KnowledgeCheck title="Check your understanding" questions={QUESTIONS} />
}
