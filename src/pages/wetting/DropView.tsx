// One droplet on a surface, drawn as a spherical cap of fixed volume, so a higher contact angle gives a taller,
// narrower drop. Smooth: flat solid. Wenzel: grooves under the drop filled with liquid. Cassie–Baxter: air in the
// grooves under the drop. The tangent line and angle arc are drawn at the right contact point.

export type Surface = 'smooth' | 'wenzel' | 'cassie'

const W = 220
const H = 170
const CX = W / 2
const Y0 = 128 // top of the solid (pillar tops)
const R90 = 44 // drop radius at θ = 90° (a hemisphere); sets the fixed volume
const PERIOD = 12 // groove period, px

interface Props {
  theta: number
  surface: Surface
  r: number
  fs: number
  label: string
}

const RAD = Math.PI / 180

/** Sphere radius of a cap with contact angle θ and the volume of a hemisphere of radius R90. */
function capRadius(theta: number): number {
  const c = Math.cos(theta * RAD)
  return R90 * (2 / (2 - 3 * c + c ** 3)) ** (1 / 3)
}

export default function DropView({ theta, surface, r, fs, label }: Props) {
  // Near 0° the cap becomes an infinitely wide film; near 180° it touches at a point. Keep it drawable.
  const t = Math.min(Math.max(theta, 6), 178)
  const R = capRadius(t)
  const a = R * Math.sin(t * RAD) // base half-width
  const left = CX - a
  const right = CX + a
  const large = t > 90 ? 1 : 0
  const drop = `M${left} ${Y0} A${R} ${R} 0 ${large} 1 ${right} ${Y0} Z`

  // Groove depth from r for a 2D square wave of half-filled period: r = 1 + 2d/p. Cassie keeps a little depth so the
  // air pockets stay visible even at r = 1.
  const rough = surface !== 'smooth'
  const depth = rough ? Math.max(((r - 1) * PERIOD) / 2, surface === 'cassie' ? 5 : 0) : 0
  const pillar = surface === 'cassie' ? Math.max(fs * PERIOD, 1.5) : PERIOD / 2
  const pillars: number[] = []
  if (rough && depth > 0) for (let x = (CX % PERIOD) - PERIOD; x < W; x += PERIOD) pillars.push(x)

  // Tangent at the right contact point: direction (−cos θ, sin θ) in math axes.
  const L = 34
  const tx = right - L * Math.cos(t * RAD)
  const ty = Y0 - L * Math.sin(t * RAD)
  const rho = 16
  const ax = right - rho * Math.cos(t * RAD)
  const ay = Y0 - rho * Math.sin(t * RAD)
  const arc = `M${right - rho} ${Y0} A${rho} ${rho} 0 0 1 ${ax} ${ay}`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="drop-svg">
      <rect width={W} height={H} className="drop-bg" />
      {surface === 'wenzel' && depth > 0 && (
        <rect x={left} y={Y0} width={right - left} height={depth} className="drop-liquid" />
      )}
      {surface === 'cassie' && <rect x={left} y={Y0} width={right - left} height={depth} className="drop-air" />}
      <rect x={0} y={Y0 + depth} width={W} height={H - Y0 - depth} className="drop-solid" />
      {pillars.map((x) => (
        <rect key={x} x={x - pillar / 2} y={Y0} width={pillar} height={depth + 0.5} className="drop-solid" />
      ))}
      <path d={drop} className="drop-liquid drop-outline" />
      <line x1={0} x2={W} y1={Y0} y2={Y0} className="drop-baseline" />
      <line x1={right} y1={Y0} x2={tx} y2={ty} className="drop-tangent" />
      <path d={arc} className="drop-arc" />
      <circle cx={right} cy={Y0} r={2.5} className="drop-contact" />
      <text x={Math.min(right + 6, W - 18)} y={Y0 + (surface === 'smooth' ? 22 : depth + 22)} className="drop-label" textAnchor="middle">
        {Math.round(theta)}°
      </text>
      {theta <= 6 && (
        <text x={CX} y={Y0 - 10} className="drop-label" textAnchor="middle">
          spreads into a film
        </text>
      )}
    </svg>
  )
}
