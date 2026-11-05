import { JsonArrayTextStep } from '../json-array-text-step.ts'

export class AdditionalReadStep extends JsonArrayTextStep {
  readonly name = 'additionalRead'
  readonly label = 'Additional read directories'
  readonly next = 'additionalWrite'
}
