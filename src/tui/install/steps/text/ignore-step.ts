import { JsonArrayTextStep } from '../json-array-text-step.ts'

export class IgnoreStep extends JsonArrayTextStep {
  readonly name = 'ignore'
  readonly label = 'Ignored paths'
  readonly next = 'additionalRead'
}
