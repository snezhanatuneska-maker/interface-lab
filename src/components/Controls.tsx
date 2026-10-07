import { useRef, type KeyboardEvent, type ReactNode } from 'react'

// Form controls shared by the simulators: a labelled slider and a segmented radio group.

interface SliderProps {
  id: string
  label: ReactNode
  /** Formatted value shown next to the label. */
  value: string
  min: number
  max: number
  step: number
  /** Raw slider position (may differ from the value, e.g. on a log scale). */
  pos: number
  onChange: (pos: number) => void
  hint?: ReactNode
}

export function Slider({ id, label, value, min, max, step, pos, onChange, hint }: SliderProps) {
  return (
    <div className="slider">
      <label htmlFor={id}>
        <span>{label}</span>
        <output htmlFor={id}>{value}</output>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={pos}
        aria-valuetext={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {hint && <small>{hint}</small>}
    </div>
  )
}

/** Slider on a log scale; values are rounded to two significant figures. */
export function LogSlider({ range, value, onChange, ...rest }: Omit<SliderProps, 'min' | 'max' | 'step' | 'pos' | 'onChange' | 'value'> & {
  range: [number, number]
  value: number
  onChange: (v: number) => void
}) {
  const [lo, hi] = range
  const pos = (Math.log(value / lo) / Math.log(hi / lo)) * LOG_STEPS
  const fromPos = (p: number) => Number((lo * (hi / lo) ** (p / LOG_STEPS)).toPrecision(2))
  return <Slider {...rest} value={fmtConst(value)} min={0} max={LOG_STEPS} step={1} pos={pos} onChange={(p) => onChange(fromPos(p))} />
}

const LOG_STEPS = 200
export const fmtConst = (v: number) => (v < 10 ? v.toFixed(1) : String(v))

export interface SegmentOption<T extends string> {
  value: T
  label: ReactNode
  /** Extra class on the button when it is selected (e.g. a series color). */
  activeClass?: string
}

interface SegmentedProps<T extends string> {
  label: string
  options: SegmentOption<T>[]
  value: T
  onChange: (v: T) => void
}

/** Radio group drawn as joined buttons. Arrow keys move the selection (WAI-ARIA radio group pattern). */
export function Segmented<T extends string>({ label, options, value, onChange }: SegmentedProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const i = options.findIndex((o) => o.value === value)
    const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
    if (!step) return
    e.preventDefault()
    const next = (i + step + options.length) % options.length
    onChange(options[next].value)
    refs.current[next]?.focus()
  }
  return (
    <div className="segmented" role="radiogroup" aria-label={label}>
      {options.map((o, i) => {
        const on = o.value === value
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el
            }}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            className={on ? `active ${o.activeClass ?? ''}` : ''}
            onClick={() => onChange(o.value)}
            onKeyDown={onKey}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
