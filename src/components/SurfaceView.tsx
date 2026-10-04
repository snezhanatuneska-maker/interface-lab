import { useMemo, type ReactNode } from 'react'
import { betLoading, betStackFractions, langmuirTheta } from '../lib/adsorption'

export type SurfaceMode = 'langmuir' | 'bet'

// Cross-section of a solid with N_SITES adsorption sites. Molecules are drawn as
// circles; the number drawn is round(N_SITES · V/Vm), so the picture follows the curves.
const N_SITES = 16
const MAX_DRAWN_LAYERS = 6
const D = 18 // molecule diameter / site pitch in SVG units
const MARGIN_X = 16
const SOLID_H = 28
const TOP_PAD = 26
const LABEL_GUTTER = 62 // room on the right for the "monolayer" label
const SITES_END = MARGIN_X + N_SITES * D
const WIDTH = SITES_END + LABEL_GUTTER
const HEIGHT = TOP_PAD + MAX_DRAWN_LAYERS * D + SOLID_H + 4
const SURFACE_Y = TOP_PAD + MAX_DRAWN_LAYERS * D

// Fixed, scrambled order in which sites get occupied, so that molecules appear
// in a natural-looking pattern and stay put as P/P0 changes.
const SITE_ORDER = [5, 11, 2, 14, 8, 0, 12, 6, 3, 15, 9, 1, 10, 4, 13, 7]

const COLORS = {
  langmuir: '#2a6fb0',
  betFirst: '#c4552b',
  betUpper: '#e9a98d',
}

/** Round fractions·n to integers that sum to n (largest-remainder method). */
function apportion(fractions: number[], n: number): number[] {
  const raw = fractions.map((f) => f * n)
  const counts = raw.map(Math.floor)
  let left = n - counts.reduce((a, b) => a + b, 0)
  const order = raw.map((r, i) => [r - Math.floor(r), i]).sort((a, b) => b[0] - a[0])
  for (let k = 0; left > 0; k++, left--) counts[order[k % order.length][1]]++
  return counts
}

/** Stack height (number of molecules) on each site, indexed by site position. */
function stackHeights(mode: SurfaceMode, x: number, K: number, C: number): number[] {
  const heights = new Array<number>(N_SITES).fill(0)

  if (mode === 'langmuir') {
    // One molecule per site at most: fill round(θ·N) sites, never stack.
    const n = Math.round(langmuirTheta(x, K) * N_SITES)
    for (let k = 0; k < n; k++) heights[SITE_ORDER[k]] = 1
    return heights
  }

  // BET: distribute stack heights following the BET site statistics
  // (fraction of sites with exactly i molecules), then nudge so the total
  // matches round(N · V/Vm) exactly.
  const target = Math.round(betLoading(x, C) * N_SITES)
  const fractions = betStackFractions(x, C, 400)
  const counts = apportion(fractions, N_SITES)
  const sorted: number[] = []
  for (let i = counts.length - 1; i >= 0; i--) for (let k = 0; k < counts[i]; k++) sorted.push(i)

  let diff = target - sorted.reduce((a, b) => a + b, 0)
  for (let k = 0; diff !== 0 && k < 10000; k++) {
    const j = k % N_SITES
    if (diff > 0) {
      sorted[j]++
      diff--
    } else if (sorted[j] > 0) {
      sorted[j]--
      diff++
    }
  }
  sorted.sort((a, b) => b - a)
  sorted.forEach((h, k) => (heights[SITE_ORDER[k]] = h))
  return heights
}

interface Props {
  mode: SurfaceMode
  x: number
  K: number
  C: number
}

export default function SurfaceView({ mode, x, K, C }: Props) {
  const heights = useMemo(() => stackHeights(mode, x, K, C), [mode, x, K, C])
  const total = heights.reduce((a, b) => a + b, 0)
  const occupied = heights.filter((h) => h > 0).length
  const tallest = Math.max(...heights)
  const loading = mode === 'langmuir' ? langmuirTheta(x, K) : betLoading(x, C)

  const circles: ReactNode[] = []
  const overflow: ReactNode[] = []
  heights.forEach((h, site) => {
    const cx = MARGIN_X + site * D + D / 2
    for (let layer = 0; layer < Math.min(h, MAX_DRAWN_LAYERS); layer++) {
      const cy = SURFACE_Y - layer * D - D / 2
      const fill = mode === 'langmuir' ? COLORS.langmuir : layer === 0 ? COLORS.betFirst : COLORS.betUpper
      circles.push(
        <circle key={`${site}-${layer}`} cx={cx} cy={cy} r={D / 2 - 1} fill={fill} stroke="#fff" strokeWidth={1} />,
      )
    }
    if (h > MAX_DRAWN_LAYERS) {
      overflow.push(
        <text key={`o-${site}`} x={cx} y={TOP_PAD - 8} textAnchor="middle" className="surface-overflow">
          +{h - MAX_DRAWN_LAYERS}
        </text>,
      )
    }
  })

  const sites = Array.from({ length: N_SITES }, (_, site) => (
    <path
      key={site}
      d={`M ${MARGIN_X + site * D + 3} ${SURFACE_Y} q ${D / 2 - 3} 5 ${D - 6} 0`}
      fill="none"
      stroke="#8a8578"
      strokeWidth={1.2}
    />
  ))

  return (
    <figure className="surface-figure">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="surface-svg"
        role="img"
        aria-label={
          mode === 'langmuir'
            ? `Langmuir: ${total} of ${N_SITES} sites occupied, single layer`
            : `BET: ${total} molecules on ${N_SITES} sites, up to ${tallest} layers`
        }
      >
        <defs>
          <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="#c9c4b6" strokeWidth="1.5" />
          </pattern>
        </defs>

        {/* monolayer guide */}
        <line
          x1={MARGIN_X}
          x2={SITES_END + 4}
          y1={SURFACE_Y - D}
          y2={SURFACE_Y - D}
          stroke="#5b6475"
          strokeDasharray="4 3"
          strokeWidth={0.8}
        />
        <text x={SITES_END + 8} y={SURFACE_Y - D + 3} className="surface-label">
          monolayer
        </text>

        {/* solid */}
        <rect x={0} y={SURFACE_Y} width={WIDTH} height={SOLID_H} fill="#ece9e1" />
        <rect x={0} y={SURFACE_Y} width={WIDTH} height={SOLID_H} fill="url(#hatch)" />
        <line x1={0} x2={WIDTH} y1={SURFACE_Y} y2={SURFACE_Y} stroke="#8a8578" strokeWidth={1.2} />
        <text x={WIDTH / 2} y={SURFACE_Y + SOLID_H / 2 + 4} textAnchor="middle" className="surface-solid-label">
          solid adsorbent
        </text>
        {sites}

        {circles}
        {overflow}
      </svg>

      <figcaption className="surface-readout">
        {mode === 'langmuir' ? (
          <>
            θ = V/V<sub>m</sub> = <strong>{loading.toFixed(2)}</strong> → <strong>{occupied}</strong> of {N_SITES}{' '}
            sites occupied, <strong>1</strong> layer
          </>
        ) : (
          <>
            V/V<sub>m</sub> = <strong>{loading.toFixed(2)}</strong> → <strong>{total}</strong> molecules on{' '}
            {N_SITES} sites ({N_SITES - occupied} bare), up to <strong>{tallest}</strong> layer{tallest === 1 ? '' : 's'}
          </>
        )}
      </figcaption>
    </figure>
  )
}
