import type { BankQuestion } from '../../lib/bank'

// Wetting concept questions (moved from the wetting page's "Try this"). The angles are checked in wetting.test.ts.

export const WETTING_BANK: BankQuestion[] = [
  {
    question: 'Young’s equation balances which three interfacial tensions?',
    correct: '$\\gamma_{SV}$, $\\gamma_{SL}$ and $\\gamma_{LV}$',
    wrong: ['Only $\\gamma_{LV}$ and gravity', '$\\gamma_{SV}$ and $\\gamma_{LV}$ only', 'Viscosity, density and $\\gamma_{LV}$'],
    explanation: 'Solid–vapor, solid–liquid and liquid–vapor tensions balance along the surface at the contact line.',
  },
  {
    question: 'A surface has $\\theta_Y$ = 70°. It is roughened to r = 1.5 (Wenzel state). The apparent angle becomes…',
    correct: 'About 59°, more hydrophilic',
    wrong: ['About 80°', 'Unchanged at 70°', 'About 105°'],
    explanation: 'cos θ_W = 1.5 × cos 70° = 0.51, so θ_W ≈ 59°. Below 90°, roughness makes the surface wet even more.',
  },
  {
    question: 'Same roughness r = 1.5, but $\\theta_Y$ = 110°. The Wenzel angle is…',
    correct: 'About 121°, more hydrophobic',
    wrong: ['About 99°, less hydrophobic', 'Unchanged at 110°', 'About 59°'],
    explanation: 'cos θ_W = 1.5 × cos 110° = −0.51, so θ_W ≈ 121°. Above 90°, roughness makes the surface repel more.',
  },
  {
    question: 'In the Cassie–Baxter state the droplet…',
    correct: 'Rests partly on air trapped in the surface texture',
    wrong: ['Fills all the grooves', 'Spreads into a film', 'Dissolves into the solid'],
    explanation: 'The drop touches only the tops of the texture (fraction f_s); the rest of its base sits on air.',
  },
  {
    question: '$\\theta_Y$ = 110°, $f_s$ = 0.1. The Cassie–Baxter angle is approximately…',
    correct: 'About 159° (superhydrophobic)',
    wrong: ['About 121°', 'About 110°', 'About 180°'],
    explanation: 'cos θ_CB = 0.1 × (cos 110° + 1) − 1 = −0.93, so θ_CB ≈ 159°, above 150°.',
    level: 'medium',
  },
  {
    question: 'What does Wenzel’s equation say roughness does?',
    correct: 'Amplifies the surface’s existing wetting tendency',
    wrong: ['Makes every surface more hydrophobic', 'Makes every surface more hydrophilic', 'Has no effect on the contact angle'],
    explanation:
      'cos θ_W = r cos θ_Y with r ≥ 1: the cosine keeps its sign and grows, so below 90° goes lower, above 90° goes higher.',
  },
  {
    question: 'Why does a drop roll off a lotus leaf but stick on a rough Wenzel surface?',
    correct: 'In Cassie–Baxter it touches little solid, so it is weakly pinned',
    wrong: ['The lotus leaf is perfectly smooth', 'The Wenzel drop has a higher contact angle', 'Gravity is stronger on the lotus leaf'],
    explanation: 'A Wenzel drop fills the grooves and is pinned in them; a Cassie–Baxter drop rests mostly on air.',
    level: 'medium',
  },
  {
    question: 'Why is the gas diffusion layer in a PEM fuel cell treated with PTFE?',
    correct: 'To make it hydrophobic so liquid water is expelled and pores don’t flood',
    wrong: ['To make it hydrophilic so water spreads through it', 'To raise its electrical conductivity', 'To make the catalyst more active'],
    explanation: 'PTFE raises θ_Y above 90°; on the rough carbon paper Wenzel makes it repel water even more, keeping gas paths open.',
  },
]
