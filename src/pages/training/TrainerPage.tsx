import ExerciseTrainer from '../../components/training/ExerciseTrainer'
import Trainer from '../../components/training/Trainer'
import { TRAINERS } from '../../data/trainers'
import { CONFIGS } from './configs'
import { EXERCISES } from './exercises'

/** A trainer's page (#/training/…): heading, intro, then the training framework with this trainer's problems. */
export default function TrainerPage({ id }: { id: string }) {
  const t = TRAINERS.find((x) => x.id === id)!
  if (t.kind === 'exercise')
    return (
      <article className="page">
        <header className="page-intro compact">
          <a className="back-link" href="#/training">
            ← All trainers
          </a>
          {t.group && <p className="eyebrow">{t.group}</p>}
          <h1>{t.title}</h1>
          <p className="lede">{t.description}</p>
        </header>
        <ExerciseTrainer key={id} id={id} def={EXERCISES[id]} />
        <p className="note ex-exam-link">
          <a href="#/exam/liquid-interfaces">Exam practice: Liquid Interfaces →</a>
        </p>
      </article>
    )
  const cfg = CONFIGS[id]
  return (
    <article className="page">
      <header className="page-intro compact">
        <a className="back-link" href="#/training">
          ← All trainers
        </a>
        <h1>{t.title}</h1>
        <p className="lede">{cfg.intro}</p>
      </header>
      {/* key: a fresh trainer (difficulty, problem, streak) when moving between trainers */}
      <Trainer key={id} id={id} generate={cfg.generate} renderData={cfg.renderData} />
    </article>
  )
}
