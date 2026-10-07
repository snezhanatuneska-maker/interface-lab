import type { ReactNode } from 'react'

interface EntryProps {
  /** Section number shown in the left margin, e.g. "1" or "2.1". */
  num: string
  title: ReactNode
  id: string
  /** Short annotation set in the notebook margin (moves under the heading on phones). */
  note?: ReactNode
  children: ReactNode
}

/** One numbered notebook section: number and margin note on the left, content on the right. */
export default function Entry({ num, title, id, note, children }: EntryProps) {
  return (
    <section className="entry" aria-labelledby={id}>
      <div className="entry-margin">
        <span className="entry-num">§{num}</span>
        {note && <div className="margin-note">{note}</div>}
      </div>
      <div className="entry-body">
        <h2 id={id}>{title}</h2>
        {children}
      </div>
    </section>
  )
}
