// A nucleus on a flat substrate, drawn as a spherical cap. The radius of curvature stays fixed (the critical
// radius is the same for both cases); only how much of the sphere sits above the substrate changes with θ.
// θ is measured through the nucleus, so 180° is a whole sphere touching at a point and 0° is a flat film.
// The dashed circle is the full homogeneous nucleus, for comparison.

const W = 360
const H = 190
const CX = W / 2
const Y0 = 142 // top of the substrate
const R = 60
const RAD = Math.PI / 180

export default function CapSketch({ theta, f }: { theta: number; f: number }) {
  const cy = Y0 + R * Math.cos(theta * RAD) // sphere centre (SVG y points down)
  const a = R * Math.sin(theta * RAD) // half-width of the contact patch
  const left = CX - a
  const right = CX + a
  const large = theta > 90 ? 1 : 0
  const whole = theta >= 179.5
  const film = theta <= 0.5
  const cap = `M${left} ${Y0} A${R} ${R} 0 ${large} 1 ${right} ${Y0}`

  // Angle arc at the right contact point, from the substrate (inside the nucleus) round to the tangent.
  const rho = 22
  const ax = right - rho * Math.cos(theta * RAD)
  const ay = Y0 - rho * Math.sin(theta * RAD)
  const tx = right - 48 * Math.cos(theta * RAD)
  const ty = Y0 - 48 * Math.sin(theta * RAD)

  const label = film
    ? 'θ = 0°: the nucleus spreads into a film, f = 0, no barrier'
    : `Spherical cap with contact angle ${Math.round(theta)}°: it holds ${(f * 100).toFixed(0)} % of the full sphere's volume`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="cnt-svg">
      <rect width={W} height={H} className="cnt-bg" />
      <rect x={0} y={Y0} width={W} height={H - Y0} className="cnt-solid" />
      <line x1={0} x2={W} y1={Y0} y2={Y0} className="cnt-solid-edge" />
      <circle cx={CX} cy={cy} r={R} className="cnt-ghost" />
      {whole && <circle cx={CX} cy={cy} r={R} className="cnt-nucleus" />}
      {!whole && !film && <path d={`${cap} Z`} className="cnt-nucleus" />}
      {film && <rect x={CX - 120} y={Y0 - 3} width={240} height={3} className="cnt-nucleus" />}
      {!whole && !film && (
        <>
          <line x1={right} y1={Y0} x2={tx} y2={ty} className="cnt-tangent" />
          <path d={`M${right - rho} ${Y0} A${rho} ${rho} 0 0 1 ${ax} ${ay}`} className="cnt-arc" />
        </>
      )}
      <text x={12} y={22} className="cnt-label">
        θ = {Math.round(theta)}°
      </text>
      <text x={W - 12} y={22} className="cnt-label" textAnchor="end">
        f = {f.toFixed(2)}
      </text>
      <text x={CX} y={Y0 + 30} className="cnt-note" textAnchor="middle">
        substrate
      </text>
    </svg>
  )
}
