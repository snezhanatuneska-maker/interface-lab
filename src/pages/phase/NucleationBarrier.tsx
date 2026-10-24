import { useMemo, useState } from 'react'
import type { Annotation, Data, Shape } from 'plotly.js'
import Plot from '../../components/Plot'
import { Slider } from '../../components/Controls'
import Tex from '../../components/Tex'
import type { ThemeColors } from '../../lib/themeColors'
import { axis, baseLayout, staticConfig } from '../../lib/plotTheme'
import { critical, deltaG, GAMMA_DEFAULT, GAMMA_RANGE, S_DEFAULT, S_RANGE } from '../../lib/phase'

const D_MAX = 8 // nm
const N_POINTS = 300

const fmt = (v: number) => (v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2))

export default function NucleationBarrier({ theme, narrow }: { theme: ThemeColors; narrow: boolean }) {
  const [S, setS] = useState(S_DEFAULT)
  const [gamma, setGamma] = useState(GAMMA_DEFAULT)
  const crit = critical(S, gamma)
  const onScale = crit !== null && crit.d <= D_MAX

  const curve = useMemo(() => {
    const ds: number[] = []
    const gs: number[] = []
    const vol: number[] = []
    const surf: number[] = []
    for (let i = 0; i <= N_POINTS; i++) {
      const d = (i / N_POINTS) * D_MAX
      ds.push(d)
      gs.push(deltaG(d, S, gamma))
      surf.push(deltaG(d, 1, gamma)) // ln 1 = 0: surface term alone
      vol.push(deltaG(d, S, gamma) - deltaG(d, 1, gamma))
    }
    return { ds, gs, vol, surf }
  }, [S, gamma])

  // Keep the barrier and the start of the curve in view; the separate terms may run off the plot.
  const yHi = Math.max(onScale ? crit.g * 1.35 : Math.max(...curve.gs) * 1.1, 20)
  const yLo = Math.max(Math.min(...curve.gs), -yHi)

  const data: Data[] = [
    { x: curve.ds, y: curve.surf, type: 'scatter', mode: 'lines', line: { color: theme.data2, width: 1.5, dash: 'dot' } },
    { x: curve.ds, y: curve.vol, type: 'scatter', mode: 'lines', line: { color: theme.data1, width: 1.5, dash: 'dot' } },
    { x: curve.ds, y: curve.gs, type: 'scatter', mode: 'lines', line: { color: theme.text, width: 3 } },
    {
      x: onScale ? [crit.d] : [],
      y: onScale ? [crit.g] : [],
      type: 'scatter',
      mode: 'markers',
      marker: { size: 11, color: theme.accent, line: { color: theme.plotBg, width: 2 } },
    },
  ]

  const shapes: Partial<Shape>[] = [
    { type: 'line', xref: 'paper', x0: 0, x1: 1, y0: 0, y1: 0, line: { color: theme.muted, width: 1 } },
    ...(onScale
      ? [
          { type: 'line' as const, x0: crit.d, x1: crit.d, y0: yLo, y1: crit.g, line: { color: theme.accent, width: 1.2, dash: 'dash' as const } },
        ]
      : []),
  ]

  const annotations: Partial<Annotation>[] = onScale
    ? [
        { x: crit.d, y: crit.g, text: 'ΔG*', showarrow: false, yshift: 14, font: { size: 13, color: theme.accent } },
        { x: crit.d, y: yLo, text: 'd*', showarrow: false, yanchor: 'bottom', xshift: 12, font: { size: 13, color: theme.accent } },
      ]
    : crit
      ? [{ xref: 'paper', yref: 'paper', x: 1, y: 1, xanchor: 'right', yanchor: 'top', text: `d* = ${fmt(crit.d)} nm (off scale →)`, showarrow: false, font: { size: 12, color: theme.accent } }]
      : [{ xref: 'paper', yref: 'paper', x: 0.02, y: 1, xanchor: 'left', yanchor: 'top', text: 'S ≤ 1: ΔG only rises', showarrow: false, font: { size: 12, color: theme.data2 } }]

  const status = !crit
    ? S === 1
      ? 'S = 1: saturated, no driving force. Only the surface term is left, so every cluster dissolves.'
      : 'S < 1: undersaturated. ΔG only rises with size, so nuclei dissolve.'
    : `Clusters smaller than d* = ${fmt(crit.d)} nm dissolve; larger ones grow. Barrier ΔG* = ${fmt(crit.g)} kT.`

  return (
    <section className="section" aria-labelledby="barrier-title">
      <h2 id="barrier-title" className="section-title">
        The nucleation barrier
      </h2>
      <p className="prose">
        In the metastable region a new phase has to start as a small cluster. Its volume term favours growth, but its
        new surface resists, so ΔG first rises and then falls.
      </p>
      <div className="formula">
        <div className="formula-body eq-math">
          <Tex
            display
            tex={
              narrow
                ? String.raw`\Delta G(d) = -\frac{\pi d^3}{6V_m}\,kT\ln S + \pi d^2\gamma`
                : String.raw`\Delta G(d) = \underbrace{-\frac{\pi d^3}{6V_m}\,kT\ln S}_{\text{volume: favours}} + \underbrace{\pi d^2\gamma}_{\text{surface: resists}}`
            }
          />
          <Tex display tex={String.raw`d^* = \frac{4\gamma V_m}{kT\ln S},\qquad \Delta G^* = \frac{\pi d^{*2}\gamma}{3}`} />
        </div>
      </div>

      <figure id="barrier-figure" className="figure">
        <div className="sim-grid phase-barrier">
          <div className="plot-col">
            <ul className="plot-legend" aria-label="Barrier plot legend">
              <li>
                <span className="key-line" style={{ borderColor: theme.text }} /> ΔG(d)
              </li>
              <li>
                <span className="key-line dotted" style={{ borderColor: theme.data1 }} /> volume term
              </li>
              <li>
                <span className="key-line dotted" style={{ borderColor: theme.data2 }} /> surface term
              </li>
            </ul>
            <div
              role="img"
              aria-label={`Nucleation free energy against cluster diameter, 0 to ${D_MAX} nm, at S ${S.toFixed(2)} and gamma ${gamma.toFixed(2)} J per square metre. ${status}`}
            >
              <Plot
                data={data}
                layout={{
                  ...baseLayout(theme),
                  showlegend: false,
                  xaxis: { ...axis(theme), title: { text: 'Cluster diameter d (nm)' }, range: [0, D_MAX] },
                  yaxis: { ...axis(theme), title: { text: 'ΔG (kT)' }, range: [yLo, yHi] },
                  shapes,
                  annotations,
                }}
                config={staticConfig}
                useResizeHandler
                className="plot"
              />
            </div>
          </div>
          <div className="phase-barrier-side">
            <Slider
              id="S"
              label={<>Supersaturation <em>S</em></>}
              value={S.toFixed(2)}
              min={S_RANGE[0]}
              max={S_RANGE[1]}
              step={0.05}
              pos={S}
              onChange={setS}
              hint="S = c/c_sat; S > 1 is supersaturated"
            />
            <Slider
              id="gamma"
              label={<>Interfacial energy <em>γ</em></>}
              value={`${gamma.toFixed(3)} J/m²`}
              min={GAMMA_RANGE[0]}
              max={GAMMA_RANGE[1]}
              step={0.005}
              pos={gamma}
              onChange={setGamma}
            />
            <dl className="results phase-results">
              <div className="result-main">
                <dt>d*</dt>
                <dd>{crit ? `${fmt(crit.d)} nm` : 'none'}</dd>
              </div>
              <div className="result-main">
                <dt>ΔG*</dt>
                <dd>{crit ? `${fmt(crit.g)} kT` : 'none'}</dd>
              </div>
            </dl>
            <p className="note">
              V<sub>m</sub> = 0.03 nm³ per molecule, T = 298 K.
            </p>
          </div>
        </div>
        <p className={`insight phase-status${crit ? '' : ' warn'}`} aria-live="polite">
          {status} Higher S → smaller d* and a lower barrier.
        </p>
        <figcaption>
          <span className="figure-label">Figure 3.</span> ΔG of a spherical cluster against its diameter (in units of
          kT). The dot marks the barrier at the critical diameter d*.
        </figcaption>
      </figure>
      <p className="callout">
        <strong>Link back:</strong> this barrier exists only in the metastable region. Inside the spinodal d²G/dx² &lt;
        0, so the barrier vanishes and the mixture separates spontaneously.
      </p>
    </section>
  )
}
