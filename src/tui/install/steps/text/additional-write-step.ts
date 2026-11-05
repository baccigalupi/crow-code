import { JsonListTextStep } from '../json-list-text-step.ts'

export class AdditionalWriteStep extends JsonListTextStep {
  readonly name = 'additionalWrite'
  readonly label = 'Additional write directories'
  readonly next = 'escalateRead'
}
