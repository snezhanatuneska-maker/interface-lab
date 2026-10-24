// Training mode: randomized practice problems. Each trainer here is listed on the side menu's Training section
// (and, once the training pages exist, on #/training). Add a trainer by adding an entry with its route as `href`.

export interface Trainer {
  id: string
  title: string
  /** Name of a topic in TOPICS. */
  topic: string
  /** One line on what the trainer asks. */
  description: string
  /** Route of the trainer page, e.g. '#/training/bet'. */
  href: string
}

export const TRAINERS: Trainer[] = []
