import { forwardRef } from 'react'
import RichText from './RichText'

interface OptionsProps {
  options: string[]
  /** The option picked, or null. */
  picked: number | null
  /** Index of the right answer; shown (✓/✗) only when `reveal` is set. */
  answer: number
  reveal: boolean
  onPick: (i: number) => void
}

/** Four answer buttons, numbered 1–4 (the keys that pick them). */
const Options = forwardRef<HTMLFieldSetElement, OptionsProps>(function Options({ options, picked, answer, reveal, onPick }, ref) {
  return (
    <fieldset ref={ref} className="choices trainer-options">
      <legend className="visually-hidden">Answers (keys 1 to 4)</legend>
      {options.map((o, i) => {
        const state = reveal ? (i === answer ? ' correct' : i === picked ? ' wrong' : '') : ''
        return (
          <button
            key={o}
            type="button"
            className={`choice${state}`}
            aria-pressed={picked === i}
            aria-keyshortcuts={String(i + 1)}
            disabled={reveal}
            onClick={() => onPick(i)}
          >
            <span className="choice-letter">{i + 1}</span> <RichText text={o} />
            {state && (
              <span className="choice-mark" aria-label={i === answer ? 'correct answer' : 'your answer, wrong'}>
                {i === answer ? '✓' : '✗'}
              </span>
            )}
          </button>
        )
      })}
    </fieldset>
  )
})

export default Options
