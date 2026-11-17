import { capillaryPressure } from './capillary'

// Pore-network model of a capillary pressure curve (lecture 4.3). The pore system is a set of vertical columns of
// cylindrical subunits, listed top → bottom. Gas at p₀ + Δp sits above every column; below every column is a
// membrane that lets only the wetting liquid through (at p₀). Optional interconnections join subunits of different
// columns (their own volume is neglected).
//
// Drainage (start full, raise Δp): a filled subunit empties when Δp > its p_c AND gas can reach it (it is a top
// subunit, or a neighbour is already empty) AND its liquid still has a continuous liquid path to the membrane.
// Liquid without such a path stays trapped (residual saturation).
// Imbibition (start empty, lower Δp): a subunit fills from below when Δp < its p_c and the subunit under it is
// filled (a bottom subunit is fed directly by the membrane).
// Volumes ∝ r² × subunit height; saturation S = V_wetting / V_pore.

export interface PoreNetwork {
  /** Subunit radii r_c in m, one array per column, top → bottom. */
  columns: number[][]
  /** Height of one subunit, m (the same for all). */
  height: number
  /** Interconnections between subunits: [[column, row], [column, row]], rows counted from the top. */
  links?: [[number, number], [number, number]][]
}

export interface Fluid {
  /** Surface tension of the wetting liquid, N/m. */
  gamma: number
  /** Contact angle δ through the wetting liquid, degrees. */
  delta: number
}

interface Node {
  col: number
  row: number
  r: number
  pc: number
  volume: number
  top: boolean
  bottom: boolean
  neighbours: number[]
  /** Index of the subunit directly below in the same column, or −1. */
  below: number
}

export function buildNodes(net: PoreNetwork, fluid: Fluid): Node[] {
  const nodes: Node[] = []
  const index: number[][] = []
  net.columns.forEach((col, c) => {
    index[c] = []
    col.forEach((r, k) => {
      index[c][k] = nodes.length
      nodes.push({
        col: c,
        row: k,
        r,
        pc: capillaryPressure(fluid.gamma, fluid.delta, r),
        volume: Math.PI * r * r * net.height,
        top: k === 0,
        bottom: k === col.length - 1,
        neighbours: [],
        below: -1,
      })
    })
  })
  const join = (a: number, b: number) => {
    nodes[a].neighbours.push(b)
    nodes[b].neighbours.push(a)
  }
  net.columns.forEach((col, c) =>
    col.forEach((_, k) => {
      if (k > 0) join(index[c][k - 1], index[c][k])
      if (k < col.length - 1) nodes[index[c][k]].below = index[c][k + 1]
    }),
  )
  for (const [[c1, k1], [c2, k2]] of net.links ?? []) join(index[c1][k1], index[c2][k2])
  return nodes
}

/** Filled subunits whose liquid connects (through filled subunits) to the membrane. */
function connectedToMembrane(nodes: Node[], filled: boolean[]): boolean[] {
  const seen = nodes.map(() => false)
  const stack = nodes.map((n, i) => (n.bottom && filled[i] ? i : -1)).filter((i) => i >= 0)
  stack.forEach((i) => (seen[i] = true))
  while (stack.length) {
    const i = stack.pop()!
    for (const j of nodes[i].neighbours)
      if (filled[j] && !seen[j]) {
        seen[j] = true
        stack.push(j)
      }
  }
  return seen
}

/** One drainage step at Δp (Pa): empties subunits one at a time until nothing more can drain. */
export function drainAt(nodes: Node[], filled: boolean[], dp: number): boolean[] {
  const f = [...filled]
  for (;;) {
    const linked = connectedToMembrane(nodes, f)
    // Gas front first: the subunit nearest the top among those that can drain.
    const next = nodes
      .map((_, i) => i)
      .filter((i) => f[i] && dp > nodes[i].pc && linked[i] && (nodes[i].top || nodes[i].neighbours.some((j) => !f[j])))
      .sort((a, b) => nodes[a].row - nodes[b].row || a - b)[0]
    if (next === undefined) return f
    f[next] = false
  }
}

/** One imbibition step at Δp (Pa): fills subunits from below until nothing more can fill. */
export function imbibeAt(nodes: Node[], filled: boolean[], dp: number): boolean[] {
  const f = [...filled]
  for (;;) {
    const next = nodes.findIndex((n, i) => !f[i] && dp < n.pc && (n.bottom || f[n.below]))
    if (next < 0) return f
    f[next] = true
  }
}

export const saturation = (nodes: Node[], filled: boolean[]) =>
  nodes.reduce((s, n, i) => s + (filled[i] ? n.volume : 0), 0) / nodes.reduce((s, n) => s + n.volume, 0)

export interface CurvePoint {
  /** Lower and upper end of the Δp range (Pa) over which this state holds. */
  from: number
  to: number
  S: number
  filled: boolean[]
}

/** Distinct capillary pressures of the subunits, ascending (Pa): where the curve can step. */
export const thresholds = (nodes: Node[]) => [...new Set(nodes.map((n) => Math.round(n.pc * 1e6) / 1e6))].sort((a, b) => a - b)

/**
 * Drainage (Δp rising from 0) and imbibition (Δp falling from above the largest p_c) as piecewise-constant
 * saturation curves, one point per Δp interval between thresholds. `top` is the end of the last interval.
 */
export function pressureCurves(net: PoreNetwork, fluid: Fluid, top?: number) {
  const nodes = buildNodes(net, fluid)
  const t = thresholds(nodes)
  const edges = [0, ...t, top ?? t[t.length - 1] * 1.4]
  const ranges = edges.slice(0, -1).map((from, i) => ({ from, to: edges[i + 1], mid: (from + edges[i + 1]) / 2 }))

  let f = nodes.map(() => true)
  const drainage: CurvePoint[] = ranges.map(({ from, to, mid }) => {
    f = drainAt(nodes, f, mid)
    return { from, to, S: saturation(nodes, f), filled: f }
  })
  f = nodes.map(() => false)
  const imbibition: CurvePoint[] = [...ranges]
    .reverse()
    .map(({ from, to, mid }) => {
      f = imbibeAt(nodes, f, mid)
      return { from, to, S: saturation(nodes, f), filled: f }
    })
    .reverse()
  return { nodes, thresholds: t, drainage, imbibition }
}

/** The curve point whose Δp range holds dp. */
export const pointAt = (curve: CurvePoint[], dp: number) => curve.find((p) => dp >= p.from && dp < p.to) ?? curve[curve.length - 1]
