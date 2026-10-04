import { useMemo, useState } from 'react'
import Plot from '../components/Plot'

// PLACEHOLDER: a generic saturating curve y = 1 - exp(-k·x), used only to
// prove that the slider → plot wiring works. Real Langmuir/BET models go here later.
const N_POINTS = 200
const X_MAX = 10

function dummyCurve(k: number) {
  const x: number[] = []
  const y: number[] = []
  for (let i = 0; i <= N_POINTS; i++) {
    const xi = (i / N_POINTS) * X_MAX
    x.push(xi)
    y.push(1 - Math.exp(-k * xi))
  }
  return { x, y }
}

export default function AdsorptionPage() {
  const [k, setK] = useState(0.5)
  const { x, y } = useMemo(() => dummyCurve(k), [k])

  return (
    <article className="page">
      <h1>Langmuir vs BET Adsorption</h1>
      <p className="lede">
        Compare monolayer (Langmuir) and multilayer (BET) adsorption isotherms interactively.
      </p>

      <section className="card">
        <div className="controls">
          <label htmlFor="k-slider">
            Parameter <em>k</em> = <strong>{k.toFixed(2)}</strong>
          </label>
          <input
            id="k-slider"
            type="range"
            min={0.05}
            max={3}
            step={0.05}
            value={k}
            onChange={(e) => setK(Number(e.target.value))}
          />
        </div>

        <Plot
          data={[
            {
              x,
              y,
              type: 'scatter',
              mode: 'lines',
              name: 'Dummy curve',
              line: { color: '#1f3a5f', width: 2.5 },
            },
          ]}
          layout={{
            autosize: true,
            margin: { l: 60, r: 20, t: 20, b: 55 },
            font: { family: 'Source Sans 3, Helvetica, Arial, sans-serif', size: 14 },
            xaxis: { title: { text: 'x (placeholder)' }, range: [0, X_MAX], zeroline: false },
            yaxis: { title: { text: 'y (placeholder)' }, range: [0, 1.05], zeroline: false },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: '#ffffff',
          }}
          config={{ displaylogo: false, responsive: true }}
          useResizeHandler
          className="plot"
        />
        <p className="caption">
          Placeholder curve <em>y</em> = 1 − exp(−<em>k</em>·<em>x</em>). Not a physical model.
        </p>
      </section>

      <section className="card">
        <h2>Background</h2>
        <p className="placeholder">
          Placeholder text. This section will introduce adsorption at solid–gas interfaces, the
          assumptions behind the Langmuir model (monolayer coverage, equivalent sites, no lateral
          interactions), and how the BET model extends it to multilayer adsorption for surface-area
          characterization of porous materials used in clean energy processes.
        </p>
      </section>
    </article>
  )
}
