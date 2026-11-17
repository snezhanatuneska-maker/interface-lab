// A capillary tube dipped in a liquid reservoir: the liquid level in the tube rises (δ < 90°), stays level (90°) or
// is depressed (δ > 90°). The drawn height is a compressed (log) picture of h_c; the meniscus follows δ.

const W = 300
const H = 260
const LEVEL = 170 // reservoir surface
const TUBE_W = 34

interface Props {
  /** Capillary rise height h_c, m (negative: depression). */
  hc: number
  delta: number
  label: string
}

export default function TubeView({ hc, delta, label }: Props) {
  // log-compressed display height: 1 µm → ~0 px, 100 m → ~140 px
  const mag = Math.min(140, Math.max(0, (Math.log10(Math.abs(hc) * 1e6 + 1) / 8) * 140))
  const shown = Math.abs(hc) < 1e-9 ? 0 : Math.sign(hc) * Math.max(mag, 6)
  const top = LEVEL - shown // liquid height in the tube at the wall
  const left = W / 2 - TUBE_W / 2
  const right = W / 2 + TUBE_W / 2
  const dip = Math.max(-12, Math.min(12, ((90 - delta) / 90) * 12)) // meniscus sag in px
  const meniscus = `M${left} ${top} Q${W / 2} ${top + 2 * dip} ${right} ${top}`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="pore-svg">
      <rect width={W} height={H} className="pore-gas" />
      <rect x={20} y={LEVEL} width={W - 40} height={H - LEVEL - 12} className="pore-liquid" />
      <line x1={20} x2={W - 20} y1={LEVEL} y2={LEVEL} className="pore-meniscus" />
      <path d={`M${left} ${H - 30} L${left} ${top} ${meniscus.slice(meniscus.indexOf('Q'))} L${right} ${H - 30} Z`} className="pore-liquid" />
      <path d={meniscus} className="pore-meniscus" />
      <rect x={left - 6} y={20} width={6} height={H - 50} className="pore-wall" />
      <rect x={right} y={20} width={6} height={H - 50} className="pore-wall" />
      {Math.abs(shown) > 8 && (
        <>
          <line x1={right + 22} x2={right + 22} y1={LEVEL} y2={top} className="tube-dim" />
          <text x={right + 28} y={(LEVEL + top) / 2 + 4} className="pore-label">
            h_c {hc > 0 ? '(rise)' : '(depression)'}
          </text>
        </>
      )}
      <text x={16} y={22} className="pore-label">
        {delta < 90 ? 'concave meniscus' : delta > 90 ? 'convex meniscus' : 'flat meniscus'}
      </text>
    </svg>
  )
}
