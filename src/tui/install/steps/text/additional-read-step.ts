import { PathsTextStep } from '../paths-text-step.ts'

export class AdditionalReadStep extends PathsTextStep {
  readonly name = 'additionalRead'
  readonly label = 'Additional read directories'
  readonly next = 'additionalWrite'
  readonly defaultPaths = []
}
