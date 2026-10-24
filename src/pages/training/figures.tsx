import Plot from '../../components/Plot'
import { axis, baseLayout, staticConfig } from '../../lib/plotTheme'
import { useThemeColors } from '../../lib/themeColors'
import { fmt } from '../../lib/training'
import type { BetData } from '../../lib/trainBet'
import type { ColloidData } from '../../lib/trainColloid'
import { X_MAX, Y_MAX, type IsothermData } from '../../lib/trainIsotherm'
import type { ZismanData } from '../../lib/trainZisman'

// Figures drawn above a trainer's question: the data each problem is about.

const Y_SCALE = 1000 // the BET transform is drawn in 10⁻³ g/cm³, as on the adsorption page

export function BetFigure({ data }: { data: BetData }) {
  const theme = useThemeColors()
  const { x, V, y, slope, intercept } = data
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

export function IsothermFigure({ data }: { data: IsothermData }) {
  const theme = useThemeColors()
  const { x, ads, des } = data
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

export function DlvoFigure({ data }: { data: ColloidData }) {
  const theme = useThemeColors()
  const d = data.dlvo
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

export function ZismanFigure({ data }: { data: ZismanData }) {
  const theme = useThemeColors()
  const { gLV, theta, cos, slope, intercept } = data
  const xs = [10, 80]
  return (
    <div className="bet-train">
      <table className="data-table">
        <caption className="visually-hidden">Contact angles of the test liquids</caption>
        <thead>
          <tr>
            <th scope="col">γ_LV [mN/m]</th>
            <th scope="col">θ</th>
            <th scope="col">cos θ</th>
          </tr>
        </thead>
        <tbody>
          {gLV.map((g, i) => (
            <tr key={g}>
              <td>{g}</td>
              <td>{theta[i]}°</td>
              <td>{cos[i].toFixed(3)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Plot
        data={[
          { x: xs, y: xs.map((g) => intercept + slope * g), mode: 'lines', line: { color: theme.data2, width: 2 }, name: 'fit' },
          { x: gLV, y: cos, mode: 'markers', marker: { color: theme.data1, size: 8 }, name: 'data' },
        ]}
        layout={{
          ...baseLayout(theme),
          showlegend: false,
          xaxis: { ...axis(theme), title: { text: 'Liquid surface tension γ_LV [mN/m]' }, range: xs, dtick: 10 },
          yaxis: { ...axis(theme), title: { text: 'cos θ' }, range: [-0.6, 1.1] },
          shapes: [{ type: 'line', x0: xs[0], x1: xs[1], y0: 1, y1: 1, line: { color: theme.axis, width: 1, dash: 'dot' } }],
        }}
        config={staticConfig}
        useResizeHandler
        className="plot"
      />
    </div>
  )
}
