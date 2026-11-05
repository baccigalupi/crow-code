import { PathsTextStep } from '../paths-text-step.ts'

export class IgnoreStep extends PathsTextStep {
  readonly name = 'ignore'
  readonly label = 'Ignored paths'
  readonly next = 'additionalRead'
  readonly defaultPaths = []
}
