import { JsonListTextStep } from '../json-list-text-step.ts'

export class IgnoreStep extends JsonListTextStep {
  readonly name = 'ignore'
  readonly label = 'Ignored paths'
  readonly next = 'additionalRead'
}
