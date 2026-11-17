import { useState, type ReactNode } from 'react'
import { makeRng, newSeed, type Rng } from '../../lib/random'
import { withinTolerance, type Field, type Part } from '../../lib/sheet1'
import Options from './Options'
import RichText from './RichText'
import Solution from './Solution'

// A course exercise as a trainer: the original task and data, a figure, and parts (a), (b), … Numeric parts are
// checked within a tolerance and come with a worked solution ending in the official answer; comment/explain parts
// reveal a model answer. "Try with new numbers" regenerates the data and follows the same solution path.

export interface ExerciseDef<P> {
  original: P
  randomize: (rng: Rng) => P
  /** Task text and data shown above the parts. */
  task: (p: P) => ReactNode
  figure: (p: P) => ReactNode
  parts: (p: P, official: boolean) => Part[]
  /** Interactive extra under a part (e.g. the pore-network simulator), if any. */
  extra?: (p: P, part: string, inputs: string[]) => ReactNode
}

export const HEADER_NOTE =
  'Final results only; the working is discussed in the exercise session. Values read from plots may differ slightly from yours.'

const parse = (s: string) => {
  const v = Number(s.replace(',', '.').replace(/\s/g, ''))
  return s.trim() === '' || !Number.isFinite(v) ? null : v
}

function FieldInput({ f, value, onChange, checked, id }: { f: Field; value: string; onChange: (v: string) => void; checked: boolean; id: string }) {
  const v = parse(value)
  const ok = v !== null && withinTolerance(v, f)
  return (
    <span className={`ex-input${checked ? (ok ? ' right' : ' wrong') : ''}`}>
      <input id={id} type="text" inputMode="decimal" autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={checked && !ok} />
      {f.unit && <span className="ex-unit">{f.unit}</span>}
      {checked && (
        <span className="ex-mark" aria-label={ok ? 'correct' : 'not within tolerance'}>
          {ok ? '✓' : '✗'}
        </span>
      )}
    </span>
  )
}

const tolText = (f: Field) => (f.tol.abs !== undefined ? `±${f.tol.abs}${f.unit ? ' ' + f.unit : ''}` : `±${Math.round((f.tol.rel ?? 0) * 100)} %`)

function PartView({ part, official, extra, uid }: { part: Part; official: boolean; extra?: (inputs: string[]) => ReactNode; uid: string }) {
  const fields = part.fields ?? []
  const [inputs, setInputs] = useState<string[]>(() => fields.map(() => ''))
  const [checked, setChecked] = useState(false)
  const [open, setOpen] = useState(false)
  const [picked, setPicked] = useState<number | null>(null)
  const set = (i: number, v: string) => {
    setInputs(inputs.map((x, k) => (k === i ? v : x)))
    setChecked(false)
  }
  const nRight = fields.filter((f, i) => {
    const v = parse(inputs[i])
    return v !== null && withinTolerance(v, f)
  }).length

  const input = (i: number) => (
    <FieldInput key={i} id={`${uid}-${part.id}-${i}`} f={fields[i]} value={inputs[i]} onChange={(v) => set(i, v)} checked={checked} />
  )

  return (
    <li className="card ex-part">
      <p className="ex-prompt">
        <strong>({part.id})</strong> <RichText text={part.prompt} />
      </p>

      {fields.length > 0 &&
        (part.table ? (
          <div className="table-wrap">
            <table className="data-table ex-table">
              <thead>
                <tr>
                  <th scope="col">{part.table.corner}</th>
                  {part.table.cols.map((c) => (
                    <th key={c} scope="col">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {part.table.rows.map((r, ri) => (
                  <tr key={r}>
                    <th scope="row">{r}</th>
                    {part.table!.cols.map((c, ci) => (
                      <td key={c}>
                        <label className="visually-hidden" htmlFor={`${uid}-${part.id}-${ri * part.table!.cols.length + ci}`}>
                          {r}, {c}
                        </label>
                        {input(ri * part.table!.cols.length + ci)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="ex-fields">
            {fields.map((f, i) => (
              <label key={i} className="ex-field" htmlFor={`${uid}-${part.id}-${i}`}>
                <span>
                  <RichText text={f.label} /> =
                </span>
                {input(i)}
              </label>
            ))}
          </div>
        ))}

      {extra?.(inputs)}

      <div className="sim-buttons ex-buttons">
        {fields.length > 0 && (
          <button type="button" className="button primary" onClick={() => setChecked(true)}>
            Check
          </button>
        )}
        <button type="button" className="button" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? 'Hide' : fields.length > 0 ? 'Show worked solution' : 'Show model answer'}
        </button>
      </div>
      {checked && (
        <p className={nRight === fields.length ? 'state-ok' : 'state-bad'} aria-live="polite">
          {nRight} of {fields.length} within tolerance ({tolText(fields[0])}).
        </p>
      )}

      {part.choice && (
        <div className="ex-choice">
          <p className="note">Concept check: {part.choice.question}</p>
          <Options options={part.choice.options} picked={picked} answer={part.choice.answer} reveal={picked !== null} onPick={setPicked} />
        </div>
      )}

      {open && (
        <div className="trainer-feedback">
          {part.steps && <Solution steps={part.steps} />}
          <p className="ex-answer">
            <strong>{fields.length === 0 ? 'Model answer: ' : official ? 'Official answer: ' : 'Answer: '}</strong>
            {official && fields.length > 0 && fields.every((f) => f.official) && !part.table ? (
              fields.map((f, i) => (
                <span key={i}>
                  {i > 0 && '; '}
                  <RichText text={f.label} /> = {f.official}
                </span>
              ))
            ) : (
              <RichText text={part.answer} />
            )}
            {part.comment && (
              <>
                {' '}
                <RichText text={part.comment} />
              </>
            )}
          </p>
          {official && part.table && fields.every((f) => f.official) && (
            <div className="table-wrap">
              <table className="data-table ex-table official">
                <caption className="note">Official answer</caption>
                <thead>
                  <tr>
                    <th scope="col">{part.table.corner}</th>
                    {part.table.cols.map((c) => (
                      <th key={c} scope="col">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {part.table.rows.map((r, ri) => (
                    <tr key={r}>
                      <th scope="row">{r}</th>
                      {part.table!.cols.map((c, ci) => (
                        <td key={c}>{fields[ri * part.table!.cols.length + ci].official}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </li>
  )
}

export default function ExerciseTrainer<P>({ def, id }: { def: ExerciseDef<P>; id: string }) {
  const [state, setState] = useState<{ p: P; official: boolean; key: number }>({ p: def.original, official: true, key: 0 })
  const parts = def.parts(state.p, state.official)
  const fresh = () => setState({ p: def.randomize(makeRng(newSeed())), official: false, key: state.key + 1 })
  const original = () => setState({ p: def.original, official: true, key: state.key + 1 })

  return (
    <section className="exercise" aria-label="Exercise">
      <p className="callout ex-header">{HEADER_NOTE}</p>
      <div className="trainer-bar">
        <button type="button" className="button primary" onClick={fresh}>
          Try with new numbers
        </button>
        {!state.official && (
          <button type="button" className="button" onClick={original}>
            Back to the original exercise
          </button>
        )}
        <p className="trainer-meta">{state.official ? 'Original exercise, official answers' : 'New numbers: same solution path'}</p>
      </div>

      <div key={`t${state.key}`} className="card ex-task">
        {def.task(state.p)}
      </div>
      <div className="ex-figure">{def.figure(state.p)}</div>

      <ol className="ex-parts" key={`p${state.key}`}>
        {parts.map((part) => (
          <PartView
            key={part.id}
            uid={id}
            part={part}
            official={state.official}
            extra={def.extra ? (inputs) => def.extra!(state.p, part.id, inputs) : undefined}
          />
        ))}
      </ol>
    </section>
  )
}
