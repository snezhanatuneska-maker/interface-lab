import Trainer from '../../components/training/Trainer'
import { generateWetting } from '../../lib/trainWetting'
import TrainerHeader from './TrainerHeader'

export default function WettingTrainerPage() {
  return (
    <article className="page">
      <TrainerHeader title="Wetting Training">
        Contact angles from Young, Wenzel and Cassie–Baxter, and which state a rough surface favours.
      </TrainerHeader>
      <Trainer id="wetting" generate={generateWetting} />
    </article>
  )
}
