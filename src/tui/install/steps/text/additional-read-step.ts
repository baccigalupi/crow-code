import { JsonListTextStep } from '../json-list-text-step.ts'

export class AdditionalReadStep extends JsonListTextStep {
  readonly name = 'additionalRead'
  readonly label = 'Additional read directories'
  readonly next = 'additionalWrite'
}
