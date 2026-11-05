import { PathsTextStep } from '../paths-text-step.ts'

export class EscalateReadStep extends PathsTextStep {
  readonly name = 'escalateRead'
  readonly label = 'Escalate read directories'
  readonly next = 'escalateWrite'
  readonly defaultPaths = []
}
