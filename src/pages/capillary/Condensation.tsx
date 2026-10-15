import { useMemo } from 'react'
import type { Data } from 'plotly.js'
import Plot from '../../components/Plot'
import Tex from '../../components/Tex'
import { LogSlider } from '../../components/Controls'
import type { ThemeColors } from '../../lib/themeColors'
import { axis, baseLayout, staticConfig } from '../../lib/plotTheme'
import { KELVIN_LENGTH, kelvinEmpty, kelvinFill, R_RANGE } from '../../lib/capillary'

const N_POINTS = 200
const f2 = (v: number) => v.toFixed(2)

interface Props {
  r: number
  setR: (r: number) => void
  theta: number
  theme: ThemeColors
}

export default function Condensation({ r, setR, theta, theme }: Props) {
  const curves = useMemo(() => {
    const rs: number[] = []
    const fill: number[] = []
    const empty: number[] = []
    const [lo, hi] = R_RANGE
    for (let i = 0; i <= N_POINTS; i++) {
      const ri = lo * (hi / lo) ** (i / N_POINTS)
      rs.push(ri)
      fill.push(kelvinFill(ri, theta))
      empty.push(kelvinEmpty(ri, theta))
    }
    return { rs, fill, empty }
  }, [theta])

  const xFill = kelvinFill(r, theta)
  const xEmpty = kelvinEmpty(r, theta)
  const condenses = xFill < 1

  // Emptying is drawn first so the filling trace can shade the loop between the two ("tonexty").
  const data: Data[] = [
    {
      x: curves.rs,
      y: curves.empty,
      type: 'scatter',
      mode: 'lines',
      line: { color: theme.data2, width: 2.5 },
    },
    {
      x: curves.rs,
      y: curves.fill,
      type: 'scatter',
      mode: 'lines',
      line: { color: theme.data1, width: 2.5 },
      fill: 'tonexty',
      fillcolor: theme.data2Soft,
    },
    {
      x: condenses ? [r, r] : [],
      y: condenses ? [xFill, xEmpty] : [],
      type: 'scatter',
      mode: 'markers',
      marker: { size: 11, color: [theme.data1, theme.data2], line: { color: theme.plotBg, width: 2 } },
    },
  ]

  return (
    <section id="cond-plot" className="section" aria-labelledby="cond-title">
      <h2 id="cond-title" className="section-title">
        Capillary condensation and hysteresis
      </h2>
      <div className="prose">
        <p>
          A curved meniscus also changes the vapour pressure. Over a concave meniscus water is stable below p₀, so
          small pores fill with liquid from the vapour (Kelvin equation). A pore fills through a cylindrical film on
          its wall and empties through a hemispherical meniscus, which is twice as curved:
        </p>
      </div>
      <div className="formula">
        <div className="formula-body">
          <Tex display tex={String.raw`\text{filling:}\quad \ln\frac{p}{p_0} = -\frac{\gamma V_m\cos\theta}{r\,RT}`} />
        </div>
        <span className="formula-number">(3)</span>
      </div>
      <div className="formula">
        <div className="formula-body">
          <Tex display tex={String.raw`\text{emptying:}\quad \ln\frac{p}{p_0} = -\frac{2\,\gamma V_m\cos\theta}{r\,RT}`} />
        </div>
        <span className="formula-number">(4)</span>
      </div>
      <p className="prose note">
        For water at 25 °C, γV<sub>m</sub>/RT = {KELVIN_LENGTH.toFixed(2)} nm (V<sub>m</sub> is the molar volume of the
        liquid).
      </p>

      <figure className="figure">
        <div className="area-controls">
          <LogSlider
            id="r-cond"
            label={<>Pore radius <em>r</em> (nm)</>}
            range={R_RANGE}
            value={r}
            onChange={setR}
            hint={`same r as above · θ = ${Math.round(theta)}°`}
          />
        </div>
        <div className="area-grid">
          <div className="plot-col">
            <ul className="plot-legend" aria-label="Plot legend">
              <li>
                <span className="key-line" style={{ borderColor: theme.data1 }} /> fills (eq. 3)
              </li>
              <li>
                <span className="key-line" style={{ borderColor: theme.data2 }} /> empties (eq. 4)
              </li>
            </ul>
            <div
              role="img"
              aria-label={
                condenses
                  ? `Kelvin plot: at r = ${r} nm the pore fills at p/p₀ ${f2(xFill)} and empties at ${f2(xEmpty)}.`
                  : `Kelvin plot: with θ = ${Math.round(theta)}° the pore does not condense below p₀.`
              }
            >
              <Plot
                data={data}
                layout={{
                  ...baseLayout(theme),
                  showlegend: false,
                  xaxis: { ...axis(theme), type: 'log', title: { text: 'Pore radius r (nm)' }, range: [0, 3] },
                  yaxis: { ...axis(theme), title: { text: 'Relative pressure p/p₀' }, range: [0, 1.02] },
                }}
                config={staticConfig}
                useResizeHandler
                className="plot"
              />
            </div>
          </div>
          <div>
            <dl className="results" aria-live="polite">
              <div>
                <dt>Pore fills at p/p₀</dt>
                <dd>{condenses ? f2(xFill) : '—'}</dd>
              </div>
              <div>
                <dt>Pore empties at p/p₀</dt>
                <dd>{condenses ? f2(xEmpty) : '—'}</dd>
              </div>
              <div className={`result-main${condenses ? '' : ' invalid'}`}>
                <dt>Hysteresis loop width</dt>
                <dd>{condenses ? f2(xFill - xEmpty) : '—'}</dd>
              </div>
            </dl>
            {!condenses && (
              <p className="result-warning" role="note">
                <strong>No condensation.</strong> θ ≥ 90°: the meniscus is convex, so the pore stays dry up to p₀.
              </p>
            )}
          </div>
        </div>
        <figcaption>
          <span className="figure-label">Figure 2.</span> Where a pore fills (blue) and empties (orange). Shaded: the
          hysteresis loop. Below ~2 nm the Kelvin equation is only a rough guide; above ~100 nm both curves sit at p₀.
        </figcaption>
      </figure>
      <p className="callout">
        <strong>Link to the adsorption lab:</strong> this is the step and the loop of a type IV isotherm. Reading where
        the loop closes gives the pore-size distribution (BJH method).
      </p>
    </section>
  )
}
