import type { Mode } from '../../lib/capillary'

// Cross-section of one pore: solid walls either side, liquid filled from the bottom and a curved meniscus on top.
// The drawn pore is 6 px per nm wide; imbibition fills 65 % of the height, drainage 35 %.

const W = 400
const H = 300

interface Props {
  r: number
  theta: number
  mode: Mode
  label: string
}

export default function PoreView({ r, theta, mode, label }: Props) {
  const poreWidth = r * 6
  const left = (W - poreWidth) / 2
  const right = left + poreWidth
  const fill = H * (mode === 'imbibition' ? 0.65 : 0.35)
  const top = H - fill
  const depth = (90 - theta) * 0.6 * (mode === 'imbibition' ? 1 : -1)
  const meniscus = `M${left} ${top} C${left + poreWidth * 0.25} ${top - depth} ${right - poreWidth * 0.25} ${top - depth} ${right} ${top}`

  return (
    <div className="surface-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="pore-svg">
        <rect width={W} height={H} className="pore-gas" />
        <rect x={0} y={0} width={left} height={H} className="pore-wall" />
        <rect x={right} y={0} width={W - right} height={H} className="pore-wall" />
        <rect x={left} y={top} width={poreWidth} height={fill} className="pore-liquid" />
        <path d={`${meniscus} Z`} className="pore-cap" />
        <path d={meniscus} className="pore-meniscus" />
        <text x={16} y={28} className="pore-label">
          Pore radius r = {r} nm
        </text>
        <text x={16} y={48} className="pore-label">
          State: {mode}
        </text>
      </svg>
    </div>
  )
}
