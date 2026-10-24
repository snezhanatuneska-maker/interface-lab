import { useEffect, useRef } from 'react'
import { onThemeChange, readThemeColors } from '../../lib/themeColors'
import { CANVAS_FONT } from '../../lib/canvas'
import { facetPolygon, facetShape, wulffDistances, type FacetShape } from '../../lib/crystal'

// 2D crystal bounded by {10} and {11} faces. Each family moves outward at its own rate, so the crystal
// keeps its growth history: faint outlines every RING_EVERY seconds show faces shrinking and vanishing.
// World units: the view spans −HALF … HALF on both axes.

const HALF = 100
const H0 = 9 // start: a small regular octagon (all faces at the same distance)
const SPEED = 16 // world units per second for the faster family
const STOP = 92 // growth stops when the crystal reaches this half-width
const RING_EVERY = 0.7 // s
const REPORT_EVERY = 120 // ms between readout updates

export interface FacetStats extends FacetShape {
  /** Half-width of the crystal (0–STOP). */
  size: number
  done: boolean
}

interface Props {
  /** Effective g{11}/g{10} (capping agent included). */
  ratio: number
  paused: boolean
  showWulff: boolean
  gammaRatio: number
  onStats: (s: FacetStats) => void
  label: string
}

export default function FacetView({ ratio, paused, showWulff, gammaRatio, onStats, label }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const props = useRef({ ratio, paused, showWulff, gammaRatio, onStats })
  props.current = { ratio, paused, showWulff, gammaRatio, onStats }

  useEffect(() => {
    const wrap = wrapRef.current!
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    let theme = readThemeColors()
    const offTheme = onThemeChange(() => (theme = readThemeColors()))

    let css = 0
    const resize = () => {
      css = Math.min(wrap.clientWidth, 420)
      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.round(css * dpr)
      canvas.height = Math.round(css * dpr)
      canvas.style.width = `${css}px`
      canvas.style.height = `${css}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)

    let h10 = H0
    let h11 = H0
    let ringClock = 0
    const rings: [number, number][] = [[h10, h11]]
    const size = () => Math.min(h10, Math.SQRT2 * h11)

    const toPx = (x: number, y: number): [number, number] => [((x + HALF) / (2 * HALF)) * css, ((HALF - y) / (2 * HALF)) * css]

    const path = (pts: [number, number][]) => {
      ctx.beginPath()
      pts.forEach(([x, y], i) => {
        const [px, py] = toPx(x, y)
        if (i) ctx.lineTo(px, py)
        else ctx.moveTo(px, py)
      })
      ctx.closePath()
    }

    const draw = () => {
      ctx.fillStyle = theme.plotBg
      ctx.fillRect(0, 0, css, css)

      // crystal: faces coloured by family ({10} axis-aligned, {11} diagonal)
      const pts = facetPolygon(h10, h11)
      path(pts)
      ctx.fillStyle = theme.accentSoft
      ctx.fill()

      // growth history, drawn over the fill
      ctx.lineWidth = 1
      ctx.strokeStyle = theme.axis
      for (const [a, b] of rings) {
        path(facetPolygon(a, b))
        ctx.stroke()
      }
      ctx.lineWidth = 3.5
      ctx.lineCap = 'round'
      for (let i = 0; i < pts.length; i++) {
        const [x0, y0] = pts[i]
        const [x1, y1] = pts[(i + 1) % pts.length]
        const axial = Math.abs(x1 - x0) < 1e-9 || Math.abs(y1 - y0) < 1e-9
        ctx.strokeStyle = axial ? theme.data1 : theme.data2
        const [p0x, p0y] = toPx(x0, y0)
        const [p1x, p1y] = toPx(x1, y1)
        ctx.beginPath()
        ctx.moveTo(p0x, p0y)
        ctx.lineTo(p1x, p1y)
        ctx.stroke()
      }

      // equilibrium (Wulff) shape with the same area, dashed
      if (props.current.showWulff) {
        const [w10, w11] = wulffDistances(props.current.gammaRatio, facetShape(h10, h11, 0).area)
        path(facetPolygon(w10, w11))
        ctx.setLineDash([6, 5])
        ctx.lineWidth = 2
        ctx.strokeStyle = theme.text
        ctx.stroke()
        ctx.setLineDash([])
      }

      // centre mark
      const [cx, cy] = toPx(0, 0)
      ctx.fillStyle = theme.muted
      ctx.beginPath()
      ctx.arc(cx, cy, 2, 0, Math.PI * 2)
      ctx.fill()

      if (size() >= STOP) {
        ctx.font = `600 13px ${CANVAS_FONT}`
        ctx.fillStyle = theme.muted
        ctx.textAlign = 'right'
        ctx.fillText('full size: Reset to grow again', css - 8, css - 8)
        ctx.textAlign = 'left'
      }
    }

    let raf = 0
    let last = performance.now()
    let lastReport = 0
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const { ratio: r, paused: p } = props.current
      if (!p && size() < STOP) {
        const fast = Math.max(1, r)
        h10 += (SPEED / fast) * dt
        h11 += ((SPEED * r) / fast) * dt
        ringClock += dt
        if (ringClock >= RING_EVERY) {
          ringClock = 0
          rings.push([h10, h11])
        }
      }
      draw()
      if (now - lastReport > REPORT_EVERY) {
        lastReport = now
        props.current.onStats({ ...facetShape(h10, h11), size: size(), done: size() >= STOP })
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      offTheme()
    }
  }, [])

  return (
    <div ref={wrapRef} className="crystal-wrap">
      <canvas ref={canvasRef} className="crystal-canvas" role="img" aria-label={label} />
    </div>
  )
}
