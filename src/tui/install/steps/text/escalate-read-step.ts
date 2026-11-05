import { JsonArrayTextStep } from '../json-array-text-step.ts'

export class EscalateReadStep extends JsonArrayTextStep {
  readonly name = 'escalateRead'
  readonly label = 'Escalate read directories'
  readonly next = 'escalateWrite'
}
