import { Fragment, useEffect, useRef, useState } from 'react'
import { Segmented } from '../../components/Controls'
import RichText from '../../components/training/RichText'
import Solution from '../../components/training/Solution'
import { EXAM_TOPICS, partPoints } from '../../data/exam'
import type { ExamPart, ExamTopic } from '../../data/exam/types'
import { EXTRAS, FIGURES } from './extras'

// Exam practice for one topic (#/exam/<id>): exam mode (all questions, answer boxes, optional timer, submit, then
// self-marking against model solutions) and study mode (model solution under each part). Answers live only in page
// memory.

type Mode = 'exam' | 'study'

/** RichText plus **bold**. */
function Text({ text }: { text: string }) {
  return (
    <>
      {text.split('**').map((s, i) => (i % 2 ? <strong key={i}>{s}</strong> : <RichText key={i} text={s} />))}
    </>
  )
}

const parse = (s: string) => {
  const v = Number(s.replace(',', '.').replace(/\s/g, ''))
  return s.trim() === '' || !Number.isFinite(v) ? null : v
}

/** Which accepted value (index) the input matches within tolerance, or −1. */
export function numericMatch(part: ExamPart, input: string): number {
  const v = parse(input)
  if (v === null || !part.numeric) return -1
  const rel = part.numeric.rel ?? 0.03
  return part.numeric.accept.findIndex((a) => Math.abs(v - a.value) <= rel * Math.abs(a.value))
}

const key = (task: string, part: string) => `${task}.${part}`
const fmtPts = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1))

function ModelSolution({ part }: { part: ExamPart }) {
  const Extra = part.extra ? EXTRAS[part.extra] : null
  return (
    <div className="trainer-feedback exam-solution">
      <p className="exam-solution-head">Model solution (not official)</p>
      {part.solution.map((v, i) => (
        <Fragment key={i}>
          {v.title && <h4 className="exam-version">{v.title}</h4>}
          <ol className="solution-steps">
            {v.steps.map((s, k) => (
              <li key={k}>
                {s.text && <Text text={s.text} />}
                {s.tex && <Solution steps={[{ text: '', tex: s.tex }]} />}
              </li>
            ))}
          </ol>
        </Fragment>
      ))}
      {part.numeric && (
        <p className="note">
          Accepted: {part.numeric.accept.map((a) => a.label).join(' or ')} (±{Math.round((part.numeric.rel ?? 0.03) * 100)} %).
        </p>
      )}
      {part.pitfall && (
        <p className="result-warning">
          <strong>Common error:</strong> {part.pitfall}
        </p>
      )}
      {Extra && <Extra />}
    </div>
  )
}

interface PartProps {
  part: ExamPart
  id: string
  mode: Mode
  submitted: boolean
  answer: string
  onAnswer: (v: string) => void
  ticks: boolean[]
  onTick: (i: number) => void
}

function PartView({ part, id, mode, submitted, answer, onAnswer, ticks, onTick }: PartProps) {
  const [open, setOpen] = useState(false)
  const match = numericMatch(part, answer)
  const inputId = `exam-${id}`
  return (
    <li className="exam-part">
      <p className="exam-prompt">
        <strong>({part.id})</strong> <Text text={part.prompt} /> <span className="exam-points">[{fmtPts(part.points)}]</span>
      </p>

      {part.numeric ? (
        <div className="exam-numeric">
          <label htmlFor={inputId}>
            <RichText text={part.numeric.symbol} /> =
          </label>
          <span className={`ex-input${submitted ? (match >= 0 ? ' right' : ' wrong') : ''}`}>
            <input id={inputId} type="text" inputMode="decimal" autoComplete="off" value={answer} onChange={(e) => onAnswer(e.target.value)} disabled={submitted && mode === 'exam'} />
            {part.numeric.unit && <span className="ex-unit">{part.numeric.unit}</span>}
            {submitted && <span className="ex-mark">{match >= 0 ? '✓' : '✗'}</span>}
          </span>
          {submitted && (
            <span className="note">
              {match === 0 ? 'correct' : match > 0 ? 'correct with the carry-forward value' : `expected ${part.numeric.accept.map((a) => a.label).join(' or ')}`}
            </span>
          )}
          <label className="visually-hidden" htmlFor={`${inputId}-work`}>
            Working for part {part.id}
          </label>
          <textarea id={`${inputId}-work`} className="exam-text small" rows={2} placeholder="Working / equation (optional)" disabled={submitted && mode === 'exam'} />
        </div>
      ) : (
        <>
          <label className="visually-hidden" htmlFor={inputId}>
            Your answer to part {part.id}
          </label>
          <textarea id={inputId} className="exam-text" rows={4} placeholder="Your answer (explain, write down, describe your sketch)" value={answer} onChange={(e) => onAnswer(e.target.value)} disabled={submitted && mode === 'exam'} />
        </>
      )}

      {mode === 'study' && !submitted && (
        <button type="button" className="button" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? 'Hide model solution' : 'Show model solution'}
        </button>
      )}
      {(open || submitted) && <ModelSolution part={part} />}

      {submitted && (
        <div className="exam-marking">
          {!part.numeric && (
            <div className="exam-compare">
              <div>
                <p className="exam-solution-head">Your answer</p>
                <p className="exam-yours">{answer.trim() || '(no answer)'}</p>
              </div>
              <div>
                <p className="exam-solution-head">Model answer</p>
                <p>{part.model}</p>
              </div>
            </div>
          )}
          <fieldset className="exam-checklist">
            <legend>Marking: tick what you covered</legend>
            {part.marking.map((m, i) => (
              <label key={i} className="exam-check">
                <input type="checkbox" checked={ticks[i] ?? false} onChange={() => onTick(i)} />
                <span>
                  {m.label} <span className="exam-points">[{fmtPts(m.points)}]</span>
                  {m.auto && <span className="note"> (auto-checked)</span>}
                </span>
              </label>
            ))}
          </fieldset>
        </div>
      )}
    </li>
  )
}

function Timer({ minutes, onExpire, stopped }: { minutes: number; onExpire: () => void; stopped: boolean }) {
  const [left, setLeft] = useState<number | null>(null)
  const expire = useRef(onExpire)
  expire.current = onExpire
  useEffect(() => {
    if (left === null || stopped) return
    if (left <= 0) {
      expire.current()
      return
    }
    const t = window.setTimeout(() => setLeft(left - 1), 1000)
    return () => window.clearTimeout(t)
  }, [left, stopped])
  if (left === null)
    return (
      <button type="button" className="button" onClick={() => setLeft(minutes * 60)}>
        Start {minutes}-minute timer (optional)
      </button>
    )
  const mm = Math.floor(Math.max(left, 0) / 60)
  const ss = String(Math.max(left, 0) % 60).padStart(2, '0')
  return (
    <p className={`exam-timer${left < 60 ? ' low' : ''}`} role="timer" aria-live={left % 60 === 0 ? 'polite' : 'off'}>
      {left <= 0 ? 'Time is up' : `${mm}:${ss} left`}
    </p>
  )
}

function ExamSheet({ exam }: { exam: ExamTopic }) {
  const total = partPoints(exam)
  const parts = exam.tasks.flatMap((t) => t.parts.map((p) => ({ task: t.id, part: p })))
  const [mode, setMode] = useState<Mode>('exam')
  const [submitted, setSubmitted] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [ticks, setTicks] = useState<Record<string, boolean[]>>({})
  const [attempt, setAttempt] = useState(0)
  const scoreRef = useRef<HTMLHeadingElement>(null)

  const submit = () => {
    const t: Record<string, boolean[]> = {}
    for (const { task, part } of parts) {
      const ok = numericMatch(part, answers[key(task, part.id)] ?? '') >= 0
      t[key(task, part.id)] = part.marking.map((m) => !!m.auto && ok)
    }
    setTicks(t)
    setSubmitted(true)
    window.setTimeout(() => scoreRef.current?.focus(), 0)
  }
  const restart = () => {
    setSubmitted(false)
    setAnswers({})
    setTicks({})
    setAttempt(attempt + 1)
  }
  const score = parts.reduce((s, { task, part }) => s + part.marking.reduce((a, m, i) => a + (ticks[key(task, part.id)]?.[i] ? m.points : 0), 0), 0)

  return (
    <>
      <div className="trainer-bar exam-bar">
        <Segmented
          label="Mode"
          value={mode}
          onChange={(m) => {
            setMode(m)
            if (submitted) restart()
          }}
          options={[
            { value: 'exam', label: 'Exam mode' },
            { value: 'study', label: 'Study mode' },
          ]}
        />
        {mode === 'exam' && !submitted && <Timer key={attempt} minutes={total} onExpire={submit} stopped={submitted} />}
      </div>
      <p className="note">
        {mode === 'exam'
          ? `All questions with their points; about 1 minute per point (${total} points → ${total} min). Answer, then submit to see the model solutions and mark yourself.`
          : 'Open the model solution under each part whenever you like.'}
      </p>

      {submitted && (
        <h2 ref={scoreRef} tabIndex={-1} className="exam-score" aria-live="polite">
          Score: {fmtPts(score)} / {total}
        </h2>
      )}

      {exam.tasks.map((task) => {
        const Fig = task.figure ? FIGURES[task.figure] : null
        const pts = task.parts.reduce((s, p) => s + p.points, 0)
        return (
          <section key={task.id} className="section exam-task" aria-labelledby={`${task.id}-title`}>
            <h2 id={`${task.id}-title`} className="section-title">
              {task.title} <span className="exam-points">[{fmtPts(pts)} points]</span>
            </h2>
            {task.intro.map((p, i) => (
              <p key={i} className="prose">
                {p}
              </p>
            ))}
            {Fig && (
              <figure className="figure tensio-figure">
                <Fig />
              </figure>
            )}
            {task.data && (
              <div className="table-wrap">
                <table className="data-table exam-data">
                  <tbody>
                    {task.data.map((d) => (
                      <tr key={d.quantity}>
                        <th scope="row">{d.quantity}</th>
                        <td>{d.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {task.note && <p className="note">{task.note}</p>}
            <ol className="exam-parts" key={attempt}>
              {task.parts.map((part) => {
                const k = key(task.id, part.id)
                return (
                  <PartView
                    key={part.id}
                    id={`${task.id}-${part.id}`}
                    part={part}
                    mode={mode}
                    submitted={submitted}
                    answer={answers[k] ?? ''}
                    onAnswer={(v) => setAnswers({ ...answers, [k]: v })}
                    ticks={ticks[k] ?? []}
                    onTick={(i) => setTicks({ ...ticks, [k]: part.marking.map((_, j) => (j === i ? !(ticks[k]?.[j] ?? false) : (ticks[k]?.[j] ?? false))) })}
                  />
                )
              })}
            </ol>
            {task.omitted && <p className="note exam-omitted">{task.omitted}</p>}
          </section>
        )
      })}

      <div className="sim-buttons exam-submit">
        {mode === 'exam' && !submitted && (
          <button type="button" className="button primary" onClick={submit}>
            Submit
          </button>
        )}
        {submitted && (
          <button type="button" className="button" onClick={restart}>
            Start again
          </button>
        )}
      </div>
    </>
  )
}

export default function ExamPage({ id }: { id: string }) {
  const exam = EXAM_TOPICS.find((e) => e.id === id)!
  return (
    <article className="page">
      <header className="page-intro compact">
        <a className="back-link" href="#/exam">
          ← Exam practice
        </a>
        <h1>Exam Practice: {exam.title}</h1>
        <p className="lede">
          Questions from the course’s specimen exam, {exam.title} tasks only. Points as in the exam. The model
          solutions are written for this site and are <strong>not official</strong> answers.
        </p>
        <p className="note">{exam.source}.</p>
      </header>
      <ExamSheet exam={exam} />
    </article>
  )
}
