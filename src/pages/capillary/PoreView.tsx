// Cross-section of one pore: solid walls either side, liquid filled from the bottom and a curved meniscus on top.
// The drawn pore is 6 px per nm of r_c wide. The meniscus is concave for δ < 90°, flat at 90° and convex above.

const W = 400
const H = 300

interface Props {
  rc: number
  delta: number
  label: string
}

export default function PoreView({ rc, delta, label }: Props) {
  const poreWidth = rc * 6
  const left = (W - poreWidth) / 2
  const right = left + poreWidth
  const fill = H * 0.55
  const top = H - fill
  const depth = (90 - delta) * 0.6
  const meniscus = `M${left} ${top} C${left + poreWidth * 0.25} ${top + depth} ${right - poreWidth * 0.25} ${top + depth} ${right} ${top}`

  return (
    <div className="surface-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="pore-svg">
        <rect width={W} height={H} className="pore-gas" />
        <rect x={0} y={0} width={left} height={H} className="pore-wall" />
        <rect x={right} y={0} width={W - right} height={H} className="pore-wall" />
        <rect x={left} y={top} width={poreWidth} height={fill} className="pore-liquid" />
        <path d={`${meniscus} Z`} className={delta < 90 ? 'pore-gas' : 'pore-cap'} />
        <path d={meniscus} className="pore-meniscus" />
        <text x={16} y={28} className="pore-label">
          r_c = {rc} nm, δ = {delta}°
        </text>
        <text x={16} y={48} className="pore-label">
          {delta < 90 ? 'concave meniscus (r < 0)' : delta > 90 ? 'convex meniscus (r > 0)' : 'flat meniscus'}
        </text>
      </svg>
    </div>
  )
}
