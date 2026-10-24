import type { Model } from '../../lib/edl'

// Cartoon of the interface: a positive surface, hydrated anions held at the OHP (GCS only) and a diffuse
// cloud whose thickness follows the Debye length. Positions come from a fixed sequence, so it does not flicker.

const W = 360
const H = 200
const SURFACE = 28 // px width of the solid
const OHP = 62 // px, x of the outer Helmholtz plane in GCS
const ROWS = [22, 52, 82, 112, 142, 172]

// Deterministic "random" numbers in (0, 1).
const rand = (i: number) => {
  const s = Math.sin(i * 12.9898 + 78.233) * 43758.5453
  return s - Math.floor(s)
}

export default function Schematic({ model, debye }: { model: Model; debye: number }) {
  const stern = model === 'gcs'
  const start = stern ? OHP + 10 : SURFACE + 8
  // Debye length → px on a log scale, so 0.03–30 nm all stay visible.
  const lam = 18 + 150 * Math.min(Math.max((Math.log10(debye) + 1.5) / 3, 0), 1)

  const ions: { x: number; y: number; neg: boolean }[] = []
  for (let i = 0; i < 26; i++) {
    // Counter-ions (anions) crowd near the surface: exponential spread with width ~ κ⁻¹.
    const x = start + -Math.log(1 - rand(i) * 0.95) * lam * 0.7
    if (x < W - 8) ions.push({ x, y: 12 + rand(i + 100) * (H - 30), neg: true })
  }
  for (let i = 0; i < 12; i++) {
    // Co-ions (cations) are pushed out: uniform, but kept clear of the first ~κ⁻¹.
    const x = start + lam * 0.8 + rand(i + 200) * (W - start - lam * 0.8 - 8)
    if (x < W - 8) ions.push({ x, y: 12 + rand(i + 300) * (H - 30), neg: false })
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMinYMid slice" className="edl-svg" role="img" aria-label={stern
      ? 'Schematic: positive surface, a row of hydrated anions at the outer Helmholtz plane, then a diffuse cloud of ions'
      : 'Schematic: positive surface with point-charge ions in a diffuse cloud reaching right up to it'}>
      <rect x="0" y="0" width={W} height={H} className="edl-bg" />
      {stern && <rect x={SURFACE} y="0" width={OHP - SURFACE} height={H} className="edl-stern" />}
      <rect x="0" y="0" width={SURFACE} height={H} className="edl-solid" />
      {ROWS.map((y) => (
        <text key={y} x={SURFACE / 2} y={y} className="edl-sign">
          +
        </text>
      ))}
      {stern && (
        <>
          {ROWS.map((y) => (
            <g key={y}>
              <circle cx={OHP - 14} cy={y} r="12" className="edl-shell" />
              <circle cx={OHP - 14} cy={y} r="6" className="head-fill neg" />
            </g>
          ))}
          <line x1={OHP} x2={OHP} y1="0" y2={H} className="edl-plane" />
          <text x={OHP + 4} y={H - 6} className="edl-label">
            OHP
          </text>
        </>
      )}
      {ions.map((ion, i) => (
        <circle key={i} cx={ion.x} cy={ion.y} r="5" className={`head-fill ${ion.neg ? 'neg' : 'pos'}`} />
      ))}
      <line x1={start + lam} x2={start + lam} y1="0" y2={H} className="edl-plane" />
      <text x={start + lam + 4} y="14" className="edl-label">
        κ⁻¹
      </text>
    </svg>
  )
}
