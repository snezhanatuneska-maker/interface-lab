import type { ReactNode } from 'react'

interface Tool {
  title: string
  blurb: string
  href?: string // undefined = coming soon
  icon: ReactNode
}

const svg = (children: ReactNode) => (
  <svg viewBox="0 0 48 48" aria-hidden="true" className="tool-icon">
    {children}
  </svg>
)

const TOOLS: Tool[] = [
  {
    title: 'Langmuir vs BET Adsorption',
    blurb:
      'Watch gas molecules adsorb on a surface: a single Langmuir monolayer vs stacking BET multilayers, with both isotherm equations explained.',
    href: '#/adsorption',
    icon: svg(
      <>
        <path d="M6 42 V6 M6 42 H44" stroke="currentColor" strokeWidth="2.5" fill="none" />
        <path d="M6 42 C10 24 14 22 26 21 S40 20 44 19" stroke="#2a6fb0" strokeWidth="3" fill="none" />
        <path d="M6 42 C10 26 16 26 26 24 S36 18 42 6" stroke="#c4552b" strokeWidth="3" fill="none" />
      </>,
    ),
  },
  {
    title: 'Contact Angle & Wetting',
    blurb: 'Young’s equation, surface energies, and how droplets spread on electrodes and membranes.',
    icon: svg(
      <>
        <path d="M4 38 H44" stroke="currentColor" strokeWidth="2.5" />
        <path d="M10 38 A14 14 0 0 1 38 38" fill="currentColor" opacity="0.35" />
      </>,
    ),
  },
  {
    title: 'DLVO Colloid Stability',
    blurb: 'Van der Waals attraction plus double-layer repulsion: when do particles in a slurry or ink aggregate?',
    icon: svg(
      <>
        <path d="M6 42 V6 M6 24 H44" stroke="currentColor" strokeWidth="2.5" fill="none" />
        <path d="M9 44 C11 18 14 12 20 14 S30 26 44 24" stroke="currentColor" strokeWidth="3" fill="none" />
      </>,
    ),
  },
  {
    title: 'Nucleation & Growth',
    blurb: 'Classical nucleation theory: the critical radius, the energy barrier, and how supersaturation controls particle size.',
    icon: svg(
      <>
        <circle cx="14" cy="30" r="4" fill="currentColor" opacity="0.5" />
        <circle cx="26" cy="24" r="7" fill="currentColor" opacity="0.5" />
        <circle cx="38" cy="18" r="10" fill="currentColor" opacity="0.5" />
      </>,
    ),
  },
]

export default function HomePage() {
  return (
    <article className="page">
      <h1>Interface Engineering Lab</h1>
      <p className="lede">
        Interactive simulators for the surface and interface phenomena behind clean energy technologies: catalysts,
        fuel cells, batteries and gas storage. Move a slider, see the physics.
      </p>

      <div className="tool-grid">
        {TOOLS.map((t) =>
          t.href ? (
            <a key={t.title} href={t.href} className="tool-card">
              {t.icon}
              <h2>{t.title}</h2>
              <p>{t.blurb}</p>
              <span className="tool-cta">Open simulator →</span>
            </a>
          ) : (
            <div key={t.title} className="tool-card disabled" aria-disabled="true">
              {t.icon}
              <h2>{t.title}</h2>
              <p>{t.blurb}</p>
              <span className="badge">Coming soon</span>
            </div>
          ),
        )}
      </div>
    </article>
  )
}
