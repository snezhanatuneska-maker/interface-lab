import { LIQUID_INTERFACES_EXAM } from './liquidInterfaces'
import type { ExamTopic } from './types'

// Exam practice topics. To add a topic later: write one data file like liquidInterfaces.ts and list it here.
export const EXAM_TOPICS: ExamTopic[] = [LIQUID_INTERFACES_EXAM]

export const examAt = (route: string) => EXAM_TOPICS.find((e) => route === `/exam/${e.id}`)
export const examFor = (topic: string) => EXAM_TOPICS.find((e) => e.topic === topic)
export const partPoints = (e: ExamTopic) => e.tasks.flatMap((t) => t.parts).reduce((s, p) => s + p.points, 0)
