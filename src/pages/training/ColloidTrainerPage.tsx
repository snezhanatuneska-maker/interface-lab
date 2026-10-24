import Plot from '../../components/Plot'
import Trainer from '../../components/training/Trainer'
import { axis, baseLayout, staticConfig } from '../../lib/plotTheme'
import { useThemeColors } from '../../lib/themeColors'
import type { Problem } from '../../lib/training'
import { generateColloid, type ColloidData } from '../../lib/trainColloid'
import TrainerHeader from './TrainerHeader'

function DlvoFigure({ problem }: { problem: Problem<ColloidData> }) {
  const theme = useThemeColors()
  const d = problem.data.dlvo
  if (!d) return null
  const top = Math.max(40, d.barrier * 1.3)
  return (
    <Plot
      data={[{ x: d.h, y: d.V, mode: 'lines', line: { color: theme.data1, width: 3 }, name: 'V(h)' }]}
      layout={{
        ...baseLayout(theme),
        showlegend: false,
        xaxis: { ...axis(theme), title: { text: 'Gap between surfaces h [nm]' }, range: [0, 30] },
        yaxis: { ...axis(theme), title: { text: 'Interaction energy V/kT' }, range: [-40, top], zeroline: true, zerolinecolor: theme.axis },
      }}
      config={staticConfig}
      useResizeHandler
      className="plot"
    />
  )
}

export default function ColloidTrainerPage() {
  return (
    <article className="page">
      <TrainerHeader title="Colloid Stability Training">
        Debye length κ⁻¹ from salt and valency, stable or coagulating from a DLVO curve, and the Schulze–Hardy rule CCC ∝ 1/z⁶.
      </TrainerHeader>
      <Trainer id="colloid" generate={generateColloid} renderData={(p) => (p.data.dlvo ? <DlvoFigure problem={p} /> : null)} />
    </article>
  )
}
