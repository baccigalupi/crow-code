import { PathsTextStep } from '../paths-text-step.ts'

export class AdditionalWriteStep extends PathsTextStep {
  readonly name = 'additionalWrite'
  readonly label = 'Additional write directories'
  readonly next = 'escalateRead'
  readonly defaultPaths = []
}
