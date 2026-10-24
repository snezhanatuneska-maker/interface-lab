import Plot from '../../components/Plot'
import Trainer from '../../components/training/Trainer'
import { axis, baseLayout, staticConfig } from '../../lib/plotTheme'
import { useThemeColors } from '../../lib/themeColors'
import type { Problem } from '../../lib/training'
import { generateIsotherm, X_MAX, Y_MAX, type IsothermData } from '../../lib/trainIsotherm'
import TrainerHeader from './TrainerHeader'

function IsothermFigure({ problem }: { problem: Problem<IsothermData> }) {
  const theme = useThemeColors()
  const { x, ads, des } = problem.data
  const top = Math.min(Math.max(...ads, ...(des ?? [])), Y_MAX) * 1.1
  return (
    <Plot
      data={[
        { x, y: ads, mode: 'lines', line: { color: theme.data1, width: 3 }, name: 'adsorption' },
        ...(des ? [{ x, y: des, mode: 'lines' as const, line: { color: theme.data2, width: 2, dash: 'dash' as const }, name: 'desorption' }] : []),
      ]}
      layout={{
        ...baseLayout(theme),
        showlegend: !!des,
        xaxis: { ...axis(theme), title: { text: 'Relative pressure p/p₀' }, range: [0, X_MAX + 0.02] },
        yaxis: { ...axis(theme), title: { text: 'Amount adsorbed V/Vₘ' }, range: [0, top] },
      }}
      config={staticConfig}
      useResizeHandler
      className="plot"
    />
  )
}

export default function IsothermTrainerPage() {
  return (
    <article className="page">
      <TrainerHeader title="Isotherm Recognition">
        Name the isotherm from its shape: Langmuir, BET, or IUPAC type I–IV. Harder levels pick curves that look more alike.
      </TrainerHeader>
      <Trainer id="isotherm" generate={generateIsotherm} renderData={(p) => <IsothermFigure problem={p} />} />
    </article>
  )
}
