import KnowledgeCheck, { type CheckQuestion } from '../../components/KnowledgeCheck'

const QUESTIONS: CheckQuestion[] = [
  {
    id: 1,
    title: "Non-Wetting Behavior",
    description: "Examine why mercury requires external pressure to enter pores.",
    prompt: "Why must external hydraulic pressure be applied during Mercury Intrusion Porosimetry?",
    options: [
      "A. Because mercury is a wetting liquid with a contact angle below 0 degrees",
      "B. Because mercury is a non-wetting liquid (θ > 90°), meaning capillary forces resist entry",
      "C. To evaporate all moisture inside the sample",
      "D. To increase the temperature of the pore network"
    ],
    correct: 1,
    explanation: "Correct! Mercury has a high contact angle (>90°), so it does not spontaneously enter pores without forced pressure."
  },
  {
    id: 2,
    title: "The Washburn Equation Scaling",
    description: "Analyze how pressure relates to pore dimensions.",
    prompt: "According to the Washburn equation, how does the required intrusion pressure P scale with pore radius r?",
    options: [
      "A. P is directly proportional to r (P ∝ r)",
      "B. P is inversely proportional to r (P ∝ 1/r)",
      "C. P is independent of pore radius",
      "D. P scales exponentially with r squared"
    ],
    correct: 1,
    explanation: "Correct! Smaller pores have smaller radii in the denominator, requiring much higher pressures to force mercury inside."
  },
  {
    id: 3,
    title: "Ink-Bottle Pore Effects",
    description: "Understand structural limitations in porosimetry curves.",
    prompt: "What causes the 'ink-bottle effect' during mercury intrusion and extrusion curves?",
    options: [
      "A. Large pore cavities being blocked by narrow neck entrances",
      "B. Chemical reactions between mercury and carbon supports",
      "C. Complete evaporation of mercury at high vacuum",
      "D. Constant pore diameters throughout the entire sample"
    ],
    correct: 0,
    explanation: "Correct! Mercury enters narrow necks at high pressure, filling larger internal cavities prematurely, leading to hysteresis during extrusion."
  }
]

export function MipsQuiz() {
  return <KnowledgeCheck title="Interactive Exercises & Knowledge Check" questions={QUESTIONS} />
}
