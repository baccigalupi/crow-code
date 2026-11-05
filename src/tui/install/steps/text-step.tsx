import type { DataStore } from '../data-store.ts'
import type { StepName, TextStepName } from '../types.ts'
import { TextPrompt } from '../text-prompt/text-prompt.tsx'
import { Step } from './step.ts'

// A one-line question: its name, what it asks, the step after it, and the
// default its input shows until something is typed.
export abstract class TextStep extends Step {
  abstract readonly name: TextStepName
  abstract readonly label: string
  abstract readonly next: StepName

  abstract placeholder(store: DataStore): string

  prompt(store: DataStore) {
    return <TextPrompt store={store} step={this} />
  }
}
