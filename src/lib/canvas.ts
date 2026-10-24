// Sizes a fixed-layout canvas for the screen's pixel density, so drawings stay sharp.
// Drawing code uses logical coordinates (w × h); CSS scales the canvas to its column width.
export function setupCanvas(canvas: HTMLCanvasElement, w: number, h: number): CanvasRenderingContext2D | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  const dpr = window.devicePixelRatio || 1
  canvas.width = Math.round(w * dpr)
  canvas.height = Math.round(h * dpr)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  return ctx
}

export const CANVAS_FONT = '"Source Sans 3", system-ui, sans-serif'
