import type { Step } from '../../lib/training'
import Tex from '../Tex'
import RichText from './RichText'

/** The worked solution, one numbered step at a time. */
export default function Solution({ steps }: { steps: Step[] }) {
  return (
    <ol className="solution-steps">
      {steps.map((s, i) => (
        <li key={i}>
          <RichText text={s.text} />
          {s.tex && (
            <div className="formula-body">
              <Tex display tex={s.tex} />
            </div>
          )}
        </li>
      ))}
    </ol>
  )
}
