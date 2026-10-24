// Training mode: randomized practice problems. Each trainer here is listed on #/training and in the side menu's
// Training section. Add a trainer by adding an entry with its route as `href` (and the route in App.tsx).

export interface Trainer {
  id: string
  title: string
  /** Name of a topic in TOPICS. */
  topic: string
  /** One line on what the trainer asks. */
  description: string
  /** Route of the trainer page, e.g. '#/training/bet'. */
  href: string
}

export const TRAINERS: Trainer[] = [
  {
    id: 'bet',
    title: 'BET Training',
    topic: 'Solid Interfaces',
    description: 'Find Vₘ, C or the surface area in m²/g from a BET dataset.',
    href: '#/training/bet',
  },
  {
    id: 'isotherm',
    title: 'Isotherm Recognition',
    topic: 'Solid Interfaces',
    description: 'Name the isotherm from its shape: Langmuir, BET or IUPAC type I–IV.',
    href: '#/training/isotherms',
  },
  {
    id: 'wetting',
    title: 'Wetting Training',
    topic: 'Liquid Interfaces',
    description: 'Contact angles from Young, Wenzel and Cassie–Baxter, and the favoured state.',
    href: '#/training/wetting',
  },
  {
    id: 'colloid',
    title: 'Colloid Stability Training',
    topic: 'Colloidal Systems',
    description: 'Debye length, stable or coagulating from a DLVO curve, and CCC ∝ 1/z⁶.',
    href: '#/training/colloids',
  },
]
