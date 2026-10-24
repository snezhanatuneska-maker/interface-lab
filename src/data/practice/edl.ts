import type { BankQuestion } from '../../lib/bank'

// Double-layer concept questions (moved from the double-layer page's "Try this" and quiz).

export const EDL_BANK: BankQuestion[] = [
  {
    question: 'Increasing the electrolyte concentration makes the Debye length…',
    correct: 'shorter',
    wrong: ['longer', 'unchanged', 'zero above 100 mM'],
    explanation: 'κ⁻¹ ∝ 1/√I, so more ions screen the surface over a shorter distance.',
  },
  {
    question: 'For a 1:1 electrolyte at 25 °C, 10 mM gives a Debye length of about…',
    correct: '3 nm',
    wrong: ['0.3 nm', '30 nm', '300 nm'],
    explanation: 'κ⁻¹ = 0.304/√I nm with I in mol/L: 0.304/√0.01 ≈ 3.0 nm.',
  },
  {
    question: 'A 1:1 salt goes from 1 mM to 100 mM. The Debye length…',
    correct: 'falls 10×, from about 9.6 nm to 0.96 nm',
    wrong: ['falls 100×, from about 9.6 nm to 0.096 nm', 'doubles', 'stays the same'],
    explanation: '100× more salt, 10× thinner layer (κ⁻¹ ∝ 1/√I). The ion clouds hug the surface.',
  },
  {
    question: 'What is the main physical flaw of the Gouy–Chapman model?',
    correct: 'It treats ions as point charges, so they can approach the surface infinitely closely',
    wrong: ['It ignores thermal motion of the ions', 'It assumes the potential is constant everywhere', 'It only works for 2:2 electrolytes'],
    explanation: 'Point charges can pile up right at the surface, which gives absurd concentrations and capacitances at high potential.',
    level: 'medium',
  },
  {
    question: 'At ψ₀ = 200 mV, Gouy–Chapman gives about 560 µF/cm², far above measured values. Adding the Stern layer brings it below about 18 µF/cm². Why?',
    correct: 'Stern and diffuse capacitances are in series, so the smaller Stern capacitance limits the total',
    wrong: ['The Stern layer adds extra charge', 'The diffuse layer disappears', 'The permittivity of water rises near the surface'],
    explanation: '1/C_tot = 1/C_Stern + 1/C_diffuse. As C_diffuse grows, C_tot levels off just below C_Stern.',
    level: 'medium',
  },
  {
    question: 'Switching from a 1:1 to a 2:2 electrolyte at the same concentration…',
    correct: 'compresses the double layer (κ⁻¹ halves)',
    wrong: ['expands the double layer', 'has no effect, since c₀ is the same', 'reverses the sign of the surface potential'],
    explanation: 'I = c₀z² is 4× larger, so κ⁻¹ halves. The counter-ion peak at the surface also grows, since the Boltzmann factor is exp(zeψ/kT).',
  },
  {
    question: 'In the diffuse layer near a negatively charged surface…',
    correct: 'cations are enriched and anions depleted relative to the bulk',
    wrong: ['anions are enriched and cations depleted', 'both are enriched', 'both stay at the bulk concentration'],
    explanation: 'Cations are the counter-ions here: c₊ = c₀ exp(−zeψ/kT) > c₀ when ψ < 0, while anions are pushed away.',
  },
]
