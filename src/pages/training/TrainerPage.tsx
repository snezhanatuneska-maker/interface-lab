import Trainer from '../../components/training/Trainer'
import { TRAINERS } from '../../data/trainers'
import { CONFIGS } from './configs'

/** A trainer's page (#/training/…): heading, intro, then the training framework with this trainer's problems. */
export default function TrainerPage({ id }: { id: string }) {
  const t = TRAINERS.find((x) => x.id === id)!
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
