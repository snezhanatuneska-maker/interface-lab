import type { BankQuestion } from '../../lib/bank'

// Mercury porosimetry concept questions (moved from the MIP page's knowledge check).

export const MIPS_BANK: BankQuestion[] = [
  {
    question: 'Why must external pressure be applied in mercury intrusion porosimetry?',
    correct: 'Mercury is non-wetting (θ > 90°), so capillary forces resist its entry',
    wrong: ['Mercury is a wetting liquid with θ below 90°', 'To evaporate all moisture inside the sample', 'To raise the temperature of the pore network'],
    explanation: 'Mercury has a contact angle of about 130–140°, so it does not enter pores unless it is pushed in.',
  },
  {
    question: 'According to the Washburn equation, how does the intrusion pressure P scale with pore radius r?',
    correct: 'P ∝ 1/r',
    wrong: ['P ∝ r', 'P is independent of r', 'P ∝ exp(r²)'],
    explanation: 'P = −2γ cos θ/r: halving the pore radius doubles the pressure needed to force mercury in.',
  },
  {
    question: 'What causes the “ink-bottle effect” in intrusion–extrusion curves?',
    correct: 'Large cavities reachable only through narrow necks',
    wrong: ['Chemical reactions between mercury and carbon supports', 'Evaporation of mercury under vacuum', 'Constant pore diameters throughout the sample'],
    explanation:
      'Mercury enters a cavity only at the pressure of its narrow neck, so the cavity is counted as a small pore, and on extrusion mercury stays trapped: hysteresis.',
    level: 'medium',
  },
]
