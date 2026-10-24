import type { ReactNode } from 'react'

/** Heading of a trainer page, with a link back to the trainer list. */
export default function TrainerHeader({ title, children }: { title: string; children: ReactNode }) {
  return (
    <header className="page-intro compact">
      <a className="back-link" href="#/training">
        ← All trainers
      </a>
      <h1>{title}</h1>
      <p className="lede">{children}</p>
    </header>
  )
}
