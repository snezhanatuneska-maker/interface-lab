// One droplet on a surface, drawn as a spherical cap of fixed volume, so a higher contact angle gives a taller,
// narrower drop. Smooth: flat solid. Wenzel: grooves under the drop filled with liquid. Cassie–Baxter: air pockets
// in the grooves under the drop. The texture is drawn larger than life so the grooves are easy to see.
// The tangent line and angle arc are drawn at the right contact point.

export type Surface = 'smooth' | 'wenzel' | 'cassie'

const W = 480
const H = 300
const CX = W / 2
const Y0 = 210 // top of the solid (pillar tops)
const R90 = 80 // drop radius at θ = 90° (a hemisphere); sets the fixed volume
const PERIOD = 18 // groove period, px

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
  const cap = `M${left} ${Y0} A${R} ${R} 0 ${large} 1 ${right} ${Y0}`

  // Deeper grooves for larger r (exaggerated). Pillar width: half the period for Wenzel, f_s of it for Cassie–Baxter.
  const rough = surface !== 'smooth'
  const depth = rough ? 12 + (r - 1) * 12 : 0
  const pillar = surface === 'cassie' ? Math.max(fs * PERIOD, 2) : PERIOD / 2
  const gap = PERIOD - pillar
  const pillars: number[] = [] // pillar centres
  if (rough) for (let x = (CX % PERIOD) - PERIOD; x < W + PERIOD; x += PERIOD) pillars.push(x)
  // Grooves (spaces between pillars) that lie under the drop, clipped to its base.
  const grooves = pillars
    .map((x) => [Math.max(x + pillar / 2, left), Math.min(x + pillar / 2 + gap, right)] as const)
    .filter(([x0, x1]) => x1 - x0 > 0.5)

  // Tangent at the right contact point: direction (−cos θ, sin θ) in math axes.
  const L = 56
  const tx = right - L * Math.cos(t * RAD)
  const ty = Y0 - L * Math.sin(t * RAD)
  const rho = 24
  const ax = right - rho * Math.cos(t * RAD)
  const ay = Y0 - rho * Math.sin(t * RAD)
  const arc = `M${right - rho} ${Y0} A${rho} ${rho} 0 0 1 ${ax} ${ay}`
  const labelX = Math.min(Math.max(right + 30, 40), W - 30)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="drop-svg">
      <rect width={W} height={H} className="drop-bg" />

      {/* Solid with its texture */}
      <rect x={0} y={Y0 + depth} width={W} height={H - Y0 - depth} className="drop-solid" />
      {pillars.map((x) => (
        <rect key={x} x={x - pillar / 2} y={Y0} width={pillar} height={depth + 1} className="drop-solid" />
      ))}
      {rough && (
        <path
          d={pillars
            .map((x) => `M${x - pillar / 2} ${Y0 + depth} V${Y0} H${x + pillar / 2} V${Y0 + depth} H${x + pillar / 2 + gap}`)
            .join(' ')}
          className="drop-solid-edge"
        />
      )}
      {!rough && <line x1={0} x2={W} y1={Y0} y2={Y0} className="drop-solid-edge" />}

      {/* Under the drop: liquid in the grooves (Wenzel) or trapped air (Cassie–Baxter) */}
      {surface === 'wenzel' &&
        grooves.map(([x0, x1]) => (
          <rect key={x0} x={x0} y={Y0 - 0.5} width={x1 - x0} height={depth + 0.5} className="drop-groove-liquid" />
        ))}
      {surface === 'cassie' &&
        grooves.map(([x0, x1]) => {
          const w = x1 - x0
          const sag = Math.min(w * 0.18, 4) // the liquid surface bows slightly into each pocket
          return (
            <g key={x0}>
              <rect x={x0} y={Y0} width={w} height={depth} className="drop-air" />
              {w > 8 && (
                <>
                  <circle cx={x0 + w * 0.35} cy={Y0 + depth * 0.62} r={Math.min(3, w / 6)} className="drop-bubble" />
                  <circle cx={x0 + w * 0.68} cy={Y0 + depth * 0.36} r={Math.min(2, w / 8)} className="drop-bubble" />
                </>
              )}
              <path d={`M${x0} ${Y0} Q${x0 + w / 2} ${Y0 + 2 * sag} ${x1} ${Y0}`} className="drop-meniscus" />
            </g>
          )
        })}

      {/* The drop */}
      <path d={`${cap} Z`} className="drop-liquid" />
      <path d={cap} className="drop-outline" />

      <line x1={right} y1={Y0} x2={tx} y2={ty} className="drop-tangent" />
      <path d={arc} className="drop-arc" />
      <circle cx={right} cy={Y0} r={3.5} className="drop-contact" />
      <text x={labelX} y={Math.min(ty, Y0 - 12) - 6} className="drop-label" textAnchor="middle">
        θ = {Math.round(theta)}°
      </text>
      {theta <= 6 && (
        <text x={CX} y={Y0 - 30} className="drop-label" textAnchor="middle">
          spreads into a film
        </text>
      )}

      <Zoom surface={surface} r={r} fs={fs} />
      {theta > 6 && (
        <path d={`M${ZX + ZW} ${ZY + ZH * 0.6} L${CX} ${Y0 + depth / 2}`} className="zoom-leader" />
      )}

      <text x={CX} y={H - 14} className="drop-note" textAnchor="middle">
        {surface === 'smooth'
          ? 'smooth solid'
          : surface === 'wenzel'
            ? 'liquid fills the grooves under the drop'
            : 'air trapped in the grooves under the drop'}
      </text>
    </svg>
  )
}

// Magnified view of the contact area under the middle of the drop.
const ZX = 12
const ZY = 12
const ZW = 168
const ZH = 112
const ZP = 56 // zoomed period

function Zoom({ surface, r, fs }: { surface: Surface; r: number; fs: number }) {
  const top = ZY + 50 // pillar tops
  const d = surface === 'smooth' ? 0 : Math.min(18 + (r - 1) * 14, ZH - 50 - 10)
  const pw = surface === 'cassie' ? Math.max(fs * ZP, 4) : ZP / 2
  const gap = ZP - pw
  const xs = [ZX - ZP / 2 + 6, ZX + ZP / 2 + 6, ZX + (3 * ZP) / 2 + 6, ZX + (5 * ZP) / 2 + 6] // pillar centres
  return (
    <g>
      <defs>
        <clipPath id={`zoom-clip-${surface}`}>
          <rect x={ZX} y={ZY} width={ZW} height={ZH} rx={6} />
        </clipPath>
      </defs>
      <g clipPath={`url(#zoom-clip-${surface})`}>
        <rect x={ZX} y={ZY} width={ZW} height={ZH} className="drop-liquid" />
        <rect x={ZX} y={top + d} width={ZW} height={ZH} className="drop-solid" />
        {surface !== 'smooth' &&
          xs.map((x) => {
            const g0 = x + pw / 2
            const sag = Math.min(gap * 0.15, 7)
            return (
              <g key={x}>
                <rect x={x - pw / 2} y={top} width={pw} height={d + 1} className="drop-solid" />
                {surface === 'wenzel' ? (
                  <rect x={g0} y={top} width={gap} height={d} className="drop-groove-liquid" />
                ) : (
                  <>
                    <path d={`M${g0} ${top} Q${g0 + gap / 2} ${top + 2 * sag} ${g0 + gap} ${top} V${top + d} H${g0} Z`} className="drop-air" />
                    <circle cx={g0 + gap * 0.3} cy={top + d * 0.65} r={3.5} className="drop-bubble" />
                    <circle cx={g0 + gap * 0.65} cy={top + d * 0.45} r={2.5} className="drop-bubble" />
                    <path d={`M${g0} ${top} Q${g0 + gap / 2} ${top + 2 * sag} ${g0 + gap} ${top}`} className="drop-meniscus" />
                  </>
                )}
              </g>
            )
          })}
        {surface !== 'smooth' && (
          <path
            d={xs.map((x) => `M${x - pw / 2} ${top + d} V${top} H${x + pw / 2} V${top + d} H${x + pw / 2 + gap}`).join(' ')}
            className="drop-solid-edge"
          />
        )}
        {surface === 'smooth' && <line x1={ZX} x2={ZX + ZW} y1={top} y2={top} className="drop-solid-edge" />}
      </g>
      <rect x={ZX} y={ZY} width={ZW} height={ZH} rx={6} className="zoom-frame" />
      <text x={ZX + 8} y={ZY + 18} className="zoom-title">
        zoom: under the drop
      </text>
    </g>
  )
}
