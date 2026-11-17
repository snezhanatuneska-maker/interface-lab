import type { Step } from '../../lib/training'

// Exam practice (#/exam): one data file per topic. Text may hold inline TeX between $…$ (RichText).

export interface MarkItem {
  label: string
  points: number
  /** Ticked automatically when the numeric answer is within tolerance. */
  auto?: boolean
}

export interface NumericAnswer {
  /** Accepted values: the calculated one first, then any carry-forward ("if you were unable to solve…") values. */
  accept: { value: number; label: string }[]
  unit: string
  /** Relative tolerance, default 0.03. */
  rel?: number
  /** Symbol shown before the input, e.g. '$\\delta$'. */
  symbol: string
}

export interface ExamPart {
  id: string
  points: number
  prompt: string
  /** Numeric answer box; otherwise a free-text box. */
  numeric?: NumericAnswer
  /** Model solution: either worked versions (e.g. with the calculated and the fallback value) or plain text. */
  solution: { title?: string; steps: Step[] }[]
  /** Short model answer shown next to the student's text after submitting. */
  model: string
  marking: MarkItem[]
  /** A common error to flag. */
  pitfall?: string
  /** Interactive extra shown with the solution. */
  extra?: string
}

export interface ExamTask {
  id: string
  title: string
  /** Exam text above the parts (paragraphs). */
  intro: string[]
  /** Figure key, drawn by the page. */
  figure?: string
  data?: { quantity: string; value: string }[]
  /** Line after the data, e.g. "You may ignore the effects of gravity". */
  note?: string
  parts: ExamPart[]
  /** Parts of the original task that are left out, with the reason. */
  omitted?: string
}

export interface ExamTopic {
  id: string
  /** Name of a topic in TOPICS (src/data/subtopics.ts). */
  topic: string
  title: string
  source: string
  tasks: ExamTask[]
}
