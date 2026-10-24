import type { BankQuestion } from '../../lib/bank'

// Capillary pressure concept questions (moved from the capillary page's exercises).

export const CAPILLARY_BANK: BankQuestion[] = [
  {
    question: 'What happens to the capillary pressure $P_c$ when the pore radius r decreases?',
    correct: 'It increases, because $P_c$ is proportional to 1/r',
    wrong: ['It decreases linearly to zero', 'It has no effect on capillary pressure', 'It drops exponentially as pores get smaller'],
    explanation: 'Radius is in the denominator of the Young–Laplace equation, P_c = 2γ cos θ/r, so smaller pores generate much higher capillary pressures.',
  },
  {
    question: 'What defines a wetting liquid (spontaneous imbibition) in terms of the contact angle θ?',
    correct: 'θ < 90°, forming a concave meniscus that rises inside the pore',
    wrong: ['θ > 90°, forming a convex meniscus', 'θ = 180°, meaning complete repulsion', 'Contact angle has no impact on pore filling'],
    explanation: 'A contact angle below 90° means the liquid wets the walls (cos θ > 0), creating capillary suction.',
  },
  {
    question: 'Why does capillary condensation occur below saturation ($p/p_0$ < 1)?',
    correct: 'The curved meniscus in the pore lowers the vapour pressure needed for condensation',
    wrong: ['The temperature drops inside the pore', 'The gas molecules expand in the pore', 'The solid walls act as catalysts'],
    explanation: 'Kelvin equation: over a concave meniscus the equilibrium vapour pressure is below p₀, the more so the narrower the pore.',
    level: 'medium',
  },
]
