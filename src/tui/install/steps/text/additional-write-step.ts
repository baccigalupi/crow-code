import { JsonArrayTextStep } from '../json-array-text-step.ts'

export class AdditionalWriteStep extends JsonArrayTextStep {
  readonly name = 'additionalWrite'
  readonly label = 'Additional write directories'
  readonly next = 'escalateRead'
}
