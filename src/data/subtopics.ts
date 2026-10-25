// Single source of truth for the homepage. Each subtopic with an `href` is listed on the Tools tab;
// one without is listed on the Upcoming Projects tab. When a new page is finished, add its route here
// as `href` (and in App.tsx) and it moves from Upcoming Projects to Tools by itself.
// Topics appear in the order of TOPICS; subtopics in the order they are listed below.

export interface Topic {
  name: string
  /** One line shown under the topic heading. */
  description: string
}

export const TOPICS: Topic[] = [
  { name: 'Liquid Interfaces', description: 'How liquids meet gases, solids and each other: surface tension, wetting and capillarity.' },
  { name: 'Solid Interfaces', description: 'How gases adsorb on solids and how solid surfaces are measured.' },
  {
    name: 'Molecular & Macroscopic Interactions',
    description: 'The forces between molecules, and how they add up between particles and surfaces.',
  },
  { name: 'Colloidal Systems', description: 'Charged particles in liquids: double layers, zeta potential and stability.' },
  { name: 'Nucleation & Growth', description: 'How a new phase forms, separates and grows into crystals.' },
]

export interface Subtopic {
  id: string
  title: string
  /** Name of a topic in TOPICS. */
  topic: string
  /** 1–2 sentences on what the simulation shows. */
  description: string
  /** 3–5 short concept tags. */
  concepts: string[]
  /** One line on why it matters for clean energy. */
  cepLink: string
  /** Route of the finished page, e.g. '#/wetting'. Leave out while the page is not built yet. */
  href?: string
  /** Lecture chapter this page belongs to, e.g. 'Chapter 3'; shown on the demo cards (#/demos) when set. */
  chapter?: string
}

// TODO: fill in `chapter` for each subtopic with the lecture chapter numbers from Prof. Klupp's
// Interface Engineering course (left empty until they are checked against the course material).
export const SUBTOPICS: Subtopic[] = [
  // ---------- Liquid Interfaces ----------
  {
    id: 'surfactants-cmc',
    title: 'Surfactants & Micelle Formation (CMC)',
    topic: 'Liquid Interfaces',
    description:
      'Add surfactant and watch micelles form at the CMC.',
    concepts: ['CMC', 'Anionic/cationic/non-ionic/zwitterionic (SDS, CTAB, Tween 20, betaine)', 'Tail length', 'Ionic repulsion'],
    cepLink: 'Surfactants control wetting and foaming in electrolytes and catalyst inks.',
    href: '#/surfactants',
  },
  {
    id: 'wetting-contact-angle',
    title: 'Wetting & Contact Angle: Young, Wenzel, Cassie–Baxter',
    topic: 'Liquid Interfaces',
    description:
      'Tune surface energy and roughness; watch a droplet wet or bead up.',
    concepts: ["Young's equation", 'Roughness amplifies wetting', 'Contact angle >150°', 'Lotus effect'],
    cepLink: 'Water management in fuel-cell gas diffusion layers and bubble release on electrolyser electrodes.',
    href: '#/wetting',
  },
  {
    id: 'capillary-pressure',
    title: 'Capillary Pressure & Pore Filling',
    topic: 'Liquid Interfaces',
    description:
      'See how pore size sets capillary pressure, rise and condensation.',
    concepts: ['Young–Laplace', "Jurin's law", 'Capillary pressure ∝ 1/r', 'Hysteresis', 'Kelvin equation'],
    cepLink: 'Liquid transport in porous electrodes and catalyst layers.',
    href: '#/capillary',
  },
  {
    id: 'mercury-porosimetry',
    title: 'Mercury Intrusion Porosimetry',
    topic: 'Liquid Interfaces',
    description: 'Push mercury into pores and get the pore-size distribution.',
    concepts: ['Washburn equation', 'Non-wetting intrusion', 'Pore-size distribution'],
    cepLink: 'Standard method for characterising fuel-cell catalyst layers.',
    href: '#/mips',
  },

  // ---------- Solid Interfaces ----------
  {
    id: 'langmuir-bet',
    title: 'Langmuir vs BET Adsorption',
    topic: 'Solid Interfaces',
    description:
      'One layer (Langmuir) vs many (BET), then surface area in m²/g.',
    concepts: ['Monolayer vs multilayer', 'Adsorption isotherm', 'Surface coverage θ', 'BET surface area'],
    cepLink: 'Gas storage, catalyst surface area and porous electrode characterisation.',
    href: '#/adsorption',
  },
  {
    id: 'zisman-plot',
    title: 'Surface Energy & the Zisman Plot',
    topic: 'Solid Interfaces',
    description:
      'Find a solid’s critical surface tension from contact angles.',
    concepts: ['Zisman plot', 'Complete wetting', 'Polar vs non-polar surfaces', 'Teflon low surface energy'],
    cepLink: 'Choosing coatings and membranes with the right wettability.',
    href: '#/zisman',
  },
  {
    id: 'surface-characterisation',
    title: 'Surface Characterisation Explorer: SEM, AFM, XPS',
    topic: 'Solid Interfaces',
    description:
      'Compare what SEM, AFM and XPS each see of one surface.',
    concepts: ['Lateral/vertical resolution', 'Cantilever and tip', 'Photoelectric effect', 'Information depth ~1–10 nm'],
    cepLink: 'How catalyst and electrode surfaces are characterised in practice.',
    href: '#/surface-explorer',
  },

  // ---------- Molecular & Macroscopic Interactions ----------
  {
    id: 'lennard-jones',
    title: 'Lennard-Jones Potential Explorer',
    topic: 'Molecular & Macroscopic Interactions',
    description:
      'Tune ε and σ and see the potential well and force.',
    concepts: ['12-6 potential', 'Equilibrium distance', 'Well depth', 'Hard-sphere limit'],
    cepLink: 'The molecular basis of adhesion, adsorption and cohesion.',
  },
  {
    id: 'van-der-waals',
    title: 'Van der Waals Forces: Keesom, Debye, London',
    topic: 'Molecular & Macroscopic Interactions',
    description:
      'Compare the three van der Waals forces with kT.',
    concepts: ['Dipole moment', 'Polarisability', 'C_vdW = C_Keesom + C_Debye + C_London', 'Thermal energy kT'],
    cepLink: 'Why molecules stick to electrode and catalyst surfaces.',
    href: '#/van-der-waals',
  },
  {
    id: 'hamaker-lifshitz',
    title: 'Hamaker & Lifshitz: vdW Between Surfaces',
    topic: 'Molecular & Macroscopic Interactions',
    description:
      'Pick two materials and a medium: attraction or repulsion?',
    concepts: ['Hamaker constant', 'A₁₃₂', 'Refractive index', 'Sphere–plane vs plane–plane geometry'],
    cepLink: 'Particle adhesion in electrode slurries and coatings.',
  },

  // ---------- Colloidal Systems ----------
  {
    id: 'double-layer',
    title: 'Electrical Double Layer: Gouy–Chapman–Stern',
    topic: 'Colloidal Systems',
    description:
      'Change salt and see the potential decay away from a surface.',
    concepts: ['Stern layer', 'Diffuse layer', 'Debye length κ⁻¹', 'Ionic strength', 'Double-layer capacitance'],
    cepLink: 'The double layer behind supercapacitors and every electrode–electrolyte interface.',
    href: '#/double-layer',
  },
  {
    id: 'zeta-potential',
    title: 'Zeta Potential & Isoelectric Point',
    topic: 'Colloidal Systems',
    description:
      'Titrate pH to find the isoelectric point.',
    concepts: ['Slipping plane', 'Electrophoretic mobility', 'IEP = PZC', 'Potential-determining ions'],
    cepLink: 'Controlling dispersion of catalyst and electrode particles.',
    href: '#/zeta',
  },
  {
    id: 'dlvo',
    title: 'DLVO Theory & Colloid Stability',
    topic: 'Colloidal Systems',
    description:
      'Add salt and watch the energy barrier collapse.',
    concepts: ['Energy barrier', 'Primary/secondary minimum', 'Critical coagulation concentration ∝ 1/z⁶', 'Steric stabilisation'],
    cepLink: 'Stable inks and slurries for fuel-cell and battery electrode manufacturing.',
    href: '#/dlvo',
  },

  // ---------- Nucleation & Growth ----------
  {
    id: 'nucleation-cnt',
    title: 'Classical Nucleation Theory: Homogeneous vs Heterogeneous',
    topic: 'Nucleation & Growth',
    description:
      'See how supersaturation and a surface set the nucleation barrier.',
    concepts: ['ΔG = −(πd³/6V_m)·kT·ln S + πd²γ', 'Critical nucleus d*', 'Nucleation rate J', 'Shape factor f(θ)'],
    cepLink: 'Where gas bubbles nucleate on electrolyser electrodes.',
    href: '#/nucleation',
  },
  {
    id: 'phase-separation',
    title: 'Phase Separation: Nucleation vs Spinodal Decomposition',
    topic: 'Nucleation & Growth',
    description:
      'Drag a mixture across the phase diagram: nucleation or spinodal decomposition?',
    concepts: ['Binodal', 'Spinodal', 'Metastable region', 'Supersaturation'],
    cepLink: 'Microstructure formation in membranes, battery electrodes and precipitated materials.',
    href: '#/phase-separation',
  },
  {
    id: 'crystal-growth',
    title: 'Crystal Growth & Shape',
    topic: 'Nucleation & Growth',
    description:
      'Grow a crystal: slow faces win, and high supersaturation makes dendrites.',
    concepts: ['BCF model', 'Diffusion-limited growth', 'Wulff construction', 'DLA', 'Kinetic Monte Carlo'],
    cepLink: 'Facet-controlled fuel-cell catalysts and lithium dendrites in batteries.',
    href: '#/crystal-growth',
  },
]

export interface TopicGroup {
  topic: Topic
  subtopics: Subtopic[]
}

/** Groups subtopics under their topics, in TOPICS order; topics with no subtopics are left out. */
export function groupByTopic(list: Subtopic[]): TopicGroup[] {
  return TOPICS.map((topic) => ({ topic, subtopics: list.filter((s) => s.topic === topic.name) })).filter(
    (g) => g.subtopics.length > 0,
  )
}

/** Subtopics with a finished page (Tools tab) and without one (Upcoming Projects tab). */
export const TOOLS = SUBTOPICS.filter((s) => s.href)
export const UPCOMING = SUBTOPICS.filter((s) => !s.href)
