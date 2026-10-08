// Single source of truth for every tool on the homepage. Live tools (status 'live') appear as cards
// on the Tools tab; planned ones on the Upcoming Projects tab, with those marked `next` shown first.
// Add, remove or reorder projects here. Categories appear in the order they are first used below.

export type ProjectStatus = 'live' | 'planned'

export interface Project {
  id: string
  title: string
  category: string
  /** 1–2 sentences on what the simulation shows. */
  description: string
  /** 3–5 short concept tags. */
  concepts: string[]
  /** One line on why it matters for clean energy. */
  cepLink: string
  status: ProjectStatus
  /** Route of the live tool; only used when status is 'live'. */
  href?: string
  /** Planned tool that is being built next; listed first on the Upcoming Projects tab. */
  next?: boolean
}

export const PROJECTS: Project[] = [
  // ---------- Liquid Interfaces ----------
  {
    id: 'surfactants-cmc',
    title: 'Surfactants & Micelle Formation (CMC)',
    category: 'Liquid Interfaces',
    description:
      'Add surfactant and watch micelles form at the CMC.',
    concepts: ['CMC', 'Anionic/cationic/non-ionic/zwitterionic (SDS, CTAB, Tween 20, betaine)', 'Tail length', 'Ionic repulsion'],
    cepLink: 'Surfactants control wetting and foaming in electrolytes and catalyst inks.',
    status: 'planned',
  },
  {
    id: 'wetting-contact-angle',
    title: 'Wetting & Contact Angle: Young, Wenzel, Cassie–Baxter',
    category: 'Liquid Interfaces',
    description:
      'Tune surface energy and roughness; watch a droplet wet or bead up.',
    concepts: ["Young's equation", 'Roughness amplifies wetting', 'Contact angle >150°', 'Lotus effect'],
    cepLink: 'Water management in fuel-cell gas diffusion layers and bubble release on electrolyzer electrodes.',
    status: 'planned',
  },
  {
    id: 'capillary-pressure',
    title: 'Capillary Pressure & Pore Filling',
    category: 'Liquid Interfaces',
    description:
      'See how pore size sets capillary pressure, rise and condensation.',
    concepts: ['Young–Laplace', "Jurin's law", 'Capillary pressure ∝ 1/r', 'Hysteresis', 'Kelvin equation'],
    cepLink: 'Liquid transport in porous electrodes and catalyst layers.',
    status: 'planned',
    next: true,
  },
  {
    id: 'mercury-porosimetry',
    title: 'Mercury Intrusion Porosimetry',
    category: 'Liquid Interfaces',
    description: 'Push mercury into pores and get the pore-size distribution.',
    concepts: ['Washburn equation', 'Non-wetting intrusion', 'Pore-size distribution'],
    cepLink: 'Standard method for characterising fuel-cell catalyst layers.',
    status: 'planned',
  },

  // ---------- Solid Interfaces ----------
  {
    id: 'langmuir-bet',
    title: 'Langmuir vs BET Adsorption',
    category: 'Solid Interfaces',
    description:
      'One layer (Langmuir) vs many (BET), then surface area in m²/g.',
    concepts: ['Monolayer vs multilayer', 'Adsorption isotherm', 'Surface coverage θ', 'BET surface area'],
    cepLink: 'Gas storage, catalyst surface area and porous electrode characterisation.',
    status: 'live',
    href: '#/adsorption',
  },
  {
    id: 'zisman-plot',
    title: 'Surface Energy & the Zisman Plot',
    category: 'Solid Interfaces',
    description:
      'Find a solid’s critical surface tension from contact angles.',
    concepts: ['Zisman plot', 'Complete wetting', 'Polar vs non-polar surfaces', 'Teflon low surface energy'],
    cepLink: 'Choosing coatings and membranes with the right wettability.',
    status: 'planned',
  },
  {
    id: 'surface-characterisation',
    title: 'Surface Characterisation Explorer: SEM, AFM, XPS',
    category: 'Solid Interfaces',
    description:
      'Compare what SEM, AFM and XPS each see of one surface.',
    concepts: ['Lateral/vertical resolution', 'Cantilever and tip', 'Photoelectric effect', 'Information depth ~1–10 nm'],
    cepLink: 'How catalyst and electrode surfaces are characterised in practice.',
    status: 'planned',
  },

  // ---------- Molecular & Macroscopic Interactions ----------
  {
    id: 'lennard-jones',
    title: 'Lennard-Jones Potential Explorer',
    category: 'Molecular & Macroscopic Interactions',
    description:
      'Tune ε and σ and see the potential well and force.',
    concepts: ['12-6 potential', 'Equilibrium distance', 'Well depth', 'Hard-sphere limit'],
    cepLink: 'The molecular basis of adhesion, adsorption and cohesion.',
    status: 'planned',
  },
  {
    id: 'van-der-waals',
    title: 'Van der Waals Forces: Keesom, Debye, London',
    category: 'Molecular & Macroscopic Interactions',
    description:
      'Compare the three van der Waals forces with kT.',
    concepts: ['Dipole moment', 'Polarisability', 'C_vdW = C_Keesom + C_Debye + C_London', 'Thermal energy kT'],
    cepLink: 'Why molecules stick to electrode and catalyst surfaces.',
    status: 'planned',
  },
  {
    id: 'hamaker-lifshitz',
    title: 'Hamaker & Lifshitz: vdW Between Surfaces',
    category: 'Molecular & Macroscopic Interactions',
    description:
      'Pick two materials and a medium: attraction or repulsion?',
    concepts: ['Hamaker constant', 'A₁₃₂', 'Refractive index', 'Sphere–plane vs plane–plane geometry'],
    cepLink: 'Particle adhesion in electrode slurries and coatings.',
    status: 'planned',
  },

  // ---------- Colloidal Systems ----------
  {
    id: 'double-layer',
    title: 'Electrical Double Layer: Gouy–Chapman–Stern',
    category: 'Colloidal Systems',
    description:
      'Change salt and see the potential decay away from a surface.',
    concepts: ['Stern layer', 'Diffuse layer', 'Debye length κ⁻¹', 'Ionic strength', 'Specific adsorption (IHP/OHP)'],
    cepLink: 'The double layer behind supercapacitors and every electrode–electrolyte interface.',
    status: 'planned',
  },
  {
    id: 'zeta-potential',
    title: 'Zeta Potential & Isoelectric Point',
    category: 'Colloidal Systems',
    description:
      'Titrate pH to find the isoelectric point.',
    concepts: ['Slipping plane', 'Electrophoretic mobility', 'IEP = PZC', 'Potential-determining ions'],
    cepLink: 'Controlling dispersion of catalyst and electrode particles.',
    status: 'planned',
    next: true,
  },
  {
    id: 'dlvo',
    title: 'DLVO Theory & Colloid Stability',
    category: 'Colloidal Systems',
    description:
      'Add salt and watch the energy barrier collapse.',
    concepts: ['Energy barrier', 'Primary/secondary minimum', 'Critical coagulation concentration ∝ 1/z⁶', 'Steric stabilisation'],
    cepLink: 'Stable inks and slurries for fuel-cell and battery electrode manufacturing.',
    status: 'planned',
    next: true,
  },

  // ---------- Nucleation & Growth ----------
  {
    id: 'nucleation-cnt',
    title: 'Classical Nucleation Theory: Homogeneous vs Heterogeneous',
    category: 'Nucleation & Growth',
    description:
      'See how supersaturation and a surface set the nucleation barrier.',
    concepts: ['ΔG = −(πd³/6V_m)·kT·ln S + πd²γ', 'Critical nucleus d*', 'Nucleation rate J', 'Shape factor f(θ)', 'Seeding'],
    cepLink: 'Controlling nucleation sets the size and number of catalyst nanoparticles.',
    status: 'planned',
  },
  {
    id: 'phase-separation',
    title: 'Phase Separation: Nucleation vs Spinodal Decomposition',
    category: 'Nucleation & Growth',
    description:
      'Nucleation vs spinodal decomposition across the phase diagram.',
    concepts: ['Binodal', 'Spinodal', 'Metastable region', 'Supersaturation'],
    cepLink: 'Microstructure formation in membranes and precipitated materials.',
    status: 'planned',
  },
  {
    id: 'crystal-growth',
    title: 'Crystal Growth & Shape',
    category: 'Nucleation & Growth',
    description:
      'Grow a crystal and see what sets its shape.',
    concepts: ['BCF model', 'Diffusion-limited growth', 'Wulff construction', 'DLA', 'Kinetic Monte Carlo'],
    cepLink: 'Tailoring nanoparticle catalysts by size and shape.',
    status: 'planned',
  },
]
