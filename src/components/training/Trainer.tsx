import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Segmented } from '../Controls'
import { makeRng, newSeed } from '../../lib/random'
import { loadStreak, nextStreak, saveStreak, type Streak } from '../../lib/streak'
import { DIFFICULTIES, type Difficulty, type Generator, type Problem } from '../../lib/training'
import Options from './Options'
import RichText from './RichText'
import Solution from './Solution'

// Reusable training framework: difficulty, Generate problem, four answers (click or keys 1–4, Space for the next
// problem), streaks saved per trainer, the worked solution after each answer, and a 10-question exam mode.

export const EXAM_LENGTH = 10

interface Seeded<D> {
  seed: number
  problem: Problem<D>
}

interface TrainerProps<D> {
  /** Key for the saved streak, e.g. 'bet'. */
  id: string
  generate: Generator<D>
  /** Draws a problem's data (table, plot) above its question. */
  renderData?: (problem: Problem<D>) => ReactNode
}

const LABELS: Record<Difficulty, string> = { easy: 'Easy', medium: 'Medium', hard: 'Hard' }
type Mode = 'practice' | 'exam'

const make = <D,>(generate: Generator<D>, difficulty: Difficulty): Seeded<D> => {
  const seed = newSeed()
  return { seed, problem: generate(makeRng(seed), difficulty) }
}

/** True while the reader is typing in a field, so the shortcut keys leave the keystroke alone. */
const typing = (el: Element | null) =>
  el instanceof HTMLElement && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))

function ProblemView<D>({ seeded, renderData }: { seeded: Seeded<D>; renderData?: TrainerProps<D>['renderData'] }) {
  return (
    <>
      {renderData && <div className="trainer-data">{renderData(seeded.problem)}</div>}
      <p className="trainer-question">
        <RichText text={seeded.problem.question} />
      </p>
    </>
  )
}

/** One exam question in the end-of-exam review, with its figure and solution behind a disclosure. */
function ReviewItem<D>({ n, seeded, picked, renderData }: { n: number; seeded: Seeded<D>; picked: number; renderData?: TrainerProps<D>['renderData'] }) {
  const [open, setOpen] = useState(false)
  const p = seeded.problem
  const right = picked === p.answer
  return (
    <li className={`card review-item ${right ? 'right' : 'wrong'}`}>
      <p className="review-head">
        <span className="review-mark" aria-hidden="true">{right ? '✓' : '✗'}</span>
        <strong>Question {n}</strong> <span className="visually-hidden">{right ? 'correct' : 'wrong'}</span>
      </p>
      <p>
        <RichText text={p.question} />
      </p>
      <dl className="review-answers">
        <dt>Your answer</dt>
        <dd>
          <RichText text={p.options[picked]} />
        </dd>
        {!right && (
          <>
            <dt>Correct answer</dt>
            <dd>
              <RichText text={p.options[p.answer]} />
            </dd>
          </>
        )}
      </dl>
      <details onToggle={(e) => setOpen(e.currentTarget.open)}>
        <summary>Show the problem and its solution</summary>
        {open && (
          <>
            {renderData && <div className="trainer-data">{renderData(p)}</div>}
            <Solution steps={p.steps} />
          </>
        )}
      </details>
    </li>
  )
}

export default function Trainer<D>({ id, generate, renderData }: TrainerProps<D>) {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [mode, setMode] = useState<Mode>('practice')

  // Practice
  const [current, setCurrent] = useState<Seeded<D>>(() => make(generate, 'easy'))
  const [picked, setPicked] = useState<number | null>(null)
  const [streak, setStreak] = useState<Streak>(() => loadStreak(id))

  // Exam
  const [exam, setExam] = useState<Seeded<D>[]>([])
  const [answers, setAnswers] = useState<number[]>([])

  const nextButton = useRef<HTMLButtonElement>(null)
  const optionsRef = useRef<HTMLFieldSetElement>(null)
  const summaryRef = useRef<HTMLHeadingElement>(null)

  const newProblem = (d = difficulty) => {
    setCurrent(make(generate, d))
    setPicked(null)
  }

  const startExam = (d = difficulty) => {
    setExam(Array.from({ length: EXAM_LENGTH }, () => make(generate, d)))
    setAnswers([])
  }

  const changeDifficulty = (d: Difficulty) => {
    setDifficulty(d)
    if (mode === 'practice') newProblem(d)
    else startExam(d)
  }

  const changeMode = (m: Mode) => {
    setMode(m)
    if (m === 'exam') startExam()
    else newProblem()
  }

  const answer = (i: number) => {
    if (mode === 'practice') {
      if (picked !== null) return
      setPicked(i)
      const s = nextStreak(streak, i === current.problem.answer)
      setStreak(s)
      saveStreak(id, s)
    } else if (answers.length < exam.length) {
      setAnswers([...answers, i])
    }
  }

  const resetStreak = () => {
    const s = { current: 0, best: 0 }
    setStreak(s)
    saveStreak(id, s)
  }

  const examDone = mode === 'exam' && exam.length > 0 && answers.length === exam.length

  // After an answer, focus moves to "Next problem" (so Space or Enter continues); in the exam, back to the options.
  useEffect(() => {
    if (mode === 'practice' && picked !== null) nextButton.current?.focus()
  }, [mode, picked])
  useEffect(() => {
    if (examDone) summaryRef.current?.focus()
  }, [examDone])

  // Keys 1–4 pick an answer; Space loads the next problem once this one is answered.
  const keyHandler = useRef<(e: KeyboardEvent) => void>(() => {})
  keyHandler.current = (e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey || e.altKey || typing(document.activeElement)) return
    const n = Number(e.key)
    if (n >= 1 && n <= 4) {
      if (mode === 'practice' && picked !== null) return
      if (mode === 'exam' && examDone) return
      e.preventDefault()
      answer(n - 1)
    } else if (e.key === ' ' && mode === 'practice' && picked !== null && !(document.activeElement instanceof HTMLButtonElement)) {
      e.preventDefault()
      newProblem()
    }
  }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => keyHandler.current(e)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const score = answers.filter((a, i) => a === exam[i]?.problem.answer).length

  return (
    <section className="trainer" aria-label="Practice problems">
      <div className="trainer-bar">
        <Segmented label="Mode" options={[{ value: 'practice', label: 'Practice' }, { value: 'exam', label: `Exam (${EXAM_LENGTH} questions)` }]} value={mode} onChange={changeMode} />
        <Segmented label="Difficulty" options={DIFFICULTIES.map((d) => ({ value: d, label: LABELS[d] }))} value={difficulty} onChange={changeDifficulty} />
      </div>

      {mode === 'practice' ? (
        <>
          <div className="trainer-bar">
            <button type="button" className="button primary" onClick={() => newProblem()}>
              Generate problem
            </button>
            <p className="trainer-streak" aria-live="polite">
              Streak <strong>{streak.current}</strong> · Best <strong>{streak.best}</strong>
            </p>
            <button type="button" className="button" onClick={resetStreak}>
              Reset
            </button>
          </div>

          <div className="card trainer-card">
            <p className="trainer-meta">Problem #{current.seed.toString(36)} · {LABELS[difficulty]}</p>
            <ProblemView seeded={current} renderData={renderData} />
            <Options ref={optionsRef} options={current.problem.options} picked={picked} answer={current.problem.answer} reveal={picked !== null} onPick={answer} />
            <p className="trainer-hint">Keys 1–4 pick an answer; Space loads the next problem.</p>

            <div aria-live="polite">
              {picked !== null && (
                <div className="trainer-feedback">
                  <p className={picked === current.problem.answer ? 'state-ok' : 'state-bad'}>
                    <strong>{picked === current.problem.answer ? 'Correct.' : 'Not quite.'}</strong> Worked solution:
                  </p>
                  <Solution steps={current.problem.steps} />
                  <button ref={nextButton} type="button" className="button primary" onClick={() => newProblem()}>
                    Next problem
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      ) : examDone ? (
        <div className="exam-summary">
          <h2 ref={summaryRef} tabIndex={-1} className="exam-score">
            Score: {score} / {exam.length}
          </h2>
          <p className="note">
            {score === exam.length ? 'All correct.' : 'Open a question below to see the problem and its worked solution.'}
          </p>
          <ol className="review-list">
            {exam.map((s, i) => (
              <ReviewItem key={s.seed + '-' + i} n={i + 1} seeded={s} picked={answers[i]} renderData={renderData} />
            ))}
          </ol>
          <button type="button" className="button primary" onClick={() => startExam()}>
            New exam
          </button>
        </div>
      ) : (
        exam.length > 0 && (
          <div className="card trainer-card">
            <p className="trainer-meta">
              Question {answers.length + 1} of {exam.length} · {LABELS[difficulty]} · no feedback until the end
            </p>
            <progress className="exam-progress" max={exam.length} value={answers.length} aria-label="Exam progress" />
            <ProblemView key={answers.length} seeded={exam[answers.length]} renderData={renderData} />
            <Options key={`o${answers.length}`} options={exam[answers.length].problem.options} picked={null} answer={-1} reveal={false} onPick={answer} />
            <p className="trainer-hint">Keys 1–4 pick an answer and move on.</p>
          </div>
        )
      )}
    </section>
  )
}
