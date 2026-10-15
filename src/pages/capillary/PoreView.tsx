import { useEffect, useRef, useState } from 'react'
import { R_RANGE } from '../../lib/capillary'

// Schematic cross-section of one pore dipped in a liquid reservoir. The meniscus meets the wall at the contact
// angle θ; the column rises (wetting) or is pushed down (non-wetting). Heights are not to scale: real rise heights
// in nanopores are kilometres, so the drawn height only grows with smaller r on a log scale.
// The column moves toward its equilibrium height (Jurin) like a damped rise; remount it (new key) to restart.

const W = 320
const H = 240
const LEVEL = 190 // reservoir surface
const WALL_BOTTOM = 215 // the tube dips this far into the reservoir
const WALL_W = 20
const INNER_L = 130
const INNER_R = 190
const A = (INNER_R - INNER_L) / 2 // drawn pore radius
const MAX_RISE = 140
const TAU = 0.6 // s, time constant of the drawn approach to equilibrium

interface Props {
  r: number
  theta: number
  paused: boolean
  /** Start with the column already at its equilibrium height instead of at the reservoir level. */
  atEquilibrium: boolean
  /** Liquid colour class: water is drawn blue, mercury grey. */
  liquid: string
  label: string
}

/** Drawn equilibrium level of the column top (SVG y). */
function equilibriumTop(r: number, cos: number): number {
  const [lo, hi] = R_RANGE
  const s = 0.25 + 0.75 * (Math.log(hi / r) / Math.log(hi / lo))
  return Math.min(Math.max(LEVEL - MAX_RISE * cos * s, 24), WALL_BOTTOM - 8)
}

export default function PoreView({ r, theta, paused, atEquilibrium, liquid, label }: Props) {
  const cos = Math.cos((theta * Math.PI) / 180)
  const sin = Math.sin((theta * Math.PI) / 180)
  const target = equilibriumTop(r, cos)
  const [top, setTop] = useState(() => (atEquilibrium ? target : LEVEL))
  const topRef = useRef(top)

  // Exponential approach to the target; the loop stops once the column has settled.
  useEffect(() => {
    if (paused || Math.abs(topRef.current - target) < 0.1) return
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now
      const diff = topRef.current - target
      topRef.current = Math.abs(diff) < 0.1 ? target : target + diff * Math.exp(-dt / TAU)
      setTop(topRef.current)
      if (topRef.current !== target) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [paused, target])

  // Sag of a circular meniscus that meets the walls at θ: d = a(1 − sin θ)/cos θ; positive = centre lower (concave).
  const sag = Math.abs(cos) < 1e-6 ? 0 : Math.max(-A, Math.min(A, (A * (1 - sin)) / cos))
  const meniscus = `M${INNER_L} ${top} Q${(INNER_L + INNER_R) / 2} ${top + 2 * sag} ${INNER_R} ${top}`
  const wetting = cos > 1e-6
  const flat = Math.abs(cos) <= 1e-6

  return (
    <div className="surface-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className={`pore-svg ${liquid}`}>
        <rect width={W} height={H} className="pore-gas" />
        {/* reservoir, leaving the inside of the tube to the column below */}
        <rect x={0} y={LEVEL} width={INNER_L} height={H - LEVEL} className="pore-liquid" />
        <rect x={INNER_R} y={LEVEL} width={W - INNER_R} height={H - LEVEL} className="pore-liquid" />
        <rect x={INNER_L} y={WALL_BOTTOM} width={INNER_R - INNER_L} height={H - WALL_BOTTOM} className="pore-liquid" />
        <path d={`${meniscus} V${WALL_BOTTOM} H${INNER_L} Z`} className="pore-liquid" />
        <path d={meniscus} className="pore-meniscus" />
        <line x1={0} y1={LEVEL} x2={INNER_L - WALL_W} y2={LEVEL} className="pore-surface" />
        <line x1={INNER_R + WALL_W} y1={LEVEL} x2={W} y2={LEVEL} className="pore-surface" />

        {/* walls */}
        <rect x={INNER_L - WALL_W} y={10} width={WALL_W} height={WALL_BOTTOM - 10} className="pore-wall" />
        <rect x={INNER_R} y={10} width={WALL_W} height={WALL_BOTTOM - 10} className="pore-wall" />

        {/* 2r across the pore */}
        <line x1={INNER_L + 2} y1={18} x2={INNER_R - 2} y2={18} className="pore-dim" markerStart="url(#pore-arrow)" markerEnd="url(#pore-arrow)" />
        <text x={(INNER_L + INNER_R) / 2} y={14} textAnchor="middle" className="pore-label">
          2r
        </text>

        {/* height of the column above or below the reservoir */}
        {!flat && Math.abs(top - LEVEL) > 10 && (
          <>
            <line x1={236} y1={LEVEL} x2={236} y2={top} className="pore-dim" markerEnd="url(#pore-arrow)" />
            <line x1={INNER_R + WALL_W} y1={top} x2={244} y2={top} className="pore-guide" />
            <text x={244} y={(LEVEL + top) / 2 + 4} className="pore-label">
              h {wetting ? '(rise)' : '(depression)'}
            </text>
          </>
        )}
        <text x={INNER_L - WALL_W - 6} y={top + 4} textAnchor="end" className="pore-label">
          θ = {Math.round(theta)}°
        </text>

        <defs>
          <marker id="pore-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" className="pore-arrowhead" />
          </marker>
        </defs>
      </svg>
    </div>
  )
}
