import { JsonListTextStep } from '../json-list-text-step.ts'

export class EscalateReadStep extends JsonListTextStep {
  readonly name = 'escalateRead'
  readonly label = 'Escalate read directories'
  readonly next = 'escalateWrite'
}
