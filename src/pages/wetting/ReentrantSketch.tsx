// Simple pillars vs re-entrant (mushroom) pillars under a low-surface-tension liquid. On simple pillars a liquid with
// δ < 90° cannot be held at the pillar tops and fills the gaps (Wenzel); the overhang of a re-entrant pillar (ψ < 90°)
// lets the meniscus hang below the cap with the local angle δ, so gas stays trapped (Cassie–Baxter).

export default function ReentrantSketch() {
  const pillars = [40, 110, 180]
  return (
    <svg viewBox="0 0 520 190" className="tensio-svg" role="img" aria-label="Left: n-hexane on simple PTFE pillars collapses into the gaps (Wenzel). Right: on re-entrant mushroom pillars the liquid hangs under the caps and gas stays trapped (Cassie–Baxter).">
      <text x="120" y="18" textAnchor="middle" className="tensio-title">simple pillars → Wenzel</text>
      <text x="390" y="18" textAnchor="middle" className="tensio-title">re-entrant (ψ &lt; 90°) → Cassie–Baxter</text>
      {/* left: liquid fills the gaps */}
      <rect x="10" y="40" width="220" height="70" className="tensio-liquid" />
      {pillars.map((x) => (
        <rect key={x} x={x - 10} y={70} width={20} height={70} className="tensio-metal" />
      ))}
      <rect x="10" y="110" width="220" height="30" className="tensio-liquid" />
      {pillars.map((x) => (
        <rect key={`p${x}`} x={x - 10} y={70} width={20} height={70} className="tensio-metal" />
      ))}
      <rect x="10" y="140" width="220" height="16" className="tensio-metal" />
      {/* right: mushrooms, liquid hangs under the caps */}
      <g transform="translate(270 0)">
        <rect x="10" y="40" width="220" height="30" className="tensio-liquid" />
        {pillars.map((x, i) => (
          <g key={x}>
            <rect x={x - 6} y={78} width={12} height={62} className="tensio-metal" />
            <path d={`M${x - 24} 78 Q${x} 58 ${x + 24} 78 Z`} className="tensio-metal" />
            {i < 2 && <path d={`M${x + 24} 78 Q${x + 35} 84 ${x + 46} 78 L${x + 46} 70 L${x + 24} 70 Z`} className="tensio-liquid" />}
            {i < 2 && <path d={`M${x + 24} 78 Q${x + 35} 84 ${x + 46} 78`} className="tensio-surface" />}
          </g>
        ))}
        <path d="M6 70 Q12 74 16 78" className="tensio-surface" />
        <rect x="10" y="140" width="220" height="16" className="tensio-metal" />
        <text x="145" y="118" textAnchor="middle" className="tensio-note">gas trapped</text>
      </g>
      <text x="120" y="178" textAnchor="middle" className="tensio-note">n-hexane on PTFE (δ &lt; 90°): fills the gaps</text>
      <text x="390" y="178" textAnchor="middle" className="tensio-note">same liquid, stays on top: super-omniphobic</text>
    </svg>
  )
}
