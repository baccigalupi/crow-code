import type { StepName, TextStepName } from '../types.ts'
import { Step } from './step.ts'

// A one-line question: its name, what it asks, the step after it, and how
// its input shows the default until something is typed.
export abstract class TextStep extends Step {
  abstract readonly name: TextStepName
  abstract readonly label: string
  abstract readonly next: StepName

  placeholder(defaultValue: string) {
    return `(${defaultValue})`
  }
}
