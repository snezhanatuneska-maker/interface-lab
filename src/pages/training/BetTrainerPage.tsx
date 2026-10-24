import Plot from '../../components/Plot'
import Trainer from '../../components/training/Trainer'
import { axis, baseLayout, staticConfig } from '../../lib/plotTheme'
import { useThemeColors } from '../../lib/themeColors'
import { fmt, type Problem } from '../../lib/training'
import { generateBet, type BetData } from '../../lib/trainBet'
import TrainerHeader from './TrainerHeader'

const Y_SCALE = 1000 // the BET transform is drawn in 10⁻³ g/cm³, as on the adsorption page

function BetFigure({ problem }: { problem: Problem<BetData> }) {
  const theme = useThemeColors()
  const { x, V, y, slope, intercept } = problem.data
  const yTop = Math.max(...y) * Y_SCALE * 1.15
  return (
    <div className="bet-train">
      <table className="data-table">
        <caption className="visually-hidden">Measured N₂ adsorption</caption>
        <thead>
          <tr>
            <th scope="col">p/p₀</th>
            <th scope="col">V [cm³(STP)/g]</th>
            <th scope="col">(p/p₀)/[V(1 − p/p₀)] [10⁻³ g/cm³]</th>
          </tr>
        </thead>
        <tbody>
          {x.map((xi, i) => (
            <tr key={xi}>
              <td>{xi.toFixed(2)}</td>
              <td>{fmt(V[i])}</td>
              <td>{fmt(y[i] * Y_SCALE)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Plot
        data={[
          { x: [0, 0.36], y: [intercept * Y_SCALE, (intercept + slope * 0.36) * Y_SCALE], mode: 'lines', line: { color: theme.data2, width: 2 }, name: 'fit' },
          { x, y: y.map((v) => v * Y_SCALE), mode: 'markers', marker: { color: theme.data1, size: 8 }, name: 'data' },
        ]}
        layout={{
          ...baseLayout(theme),
          showlegend: false,
          xaxis: { ...axis(theme), title: { text: 'Relative pressure p/p₀' }, range: [0, 0.36], dtick: 0.05 },
          yaxis: { ...axis(theme), title: { text: 'BET transform [10⁻³ g/cm³]' }, range: [0, yTop] },
        }}
        config={staticConfig}
        useResizeHandler
        className="plot"
      />
    </div>
  )
}

export default function BetTrainerPage() {
  return (
    <article className="page">
      <TrainerHeader title="BET Training">
        From a BET dataset to the monolayer capacity Vₘ, the BET constant C and the specific surface area.
      </TrainerHeader>
      <Trainer id="bet" generate={generateBet} renderData={(p) => <BetFigure problem={p} />} />
    </article>
  )
}
