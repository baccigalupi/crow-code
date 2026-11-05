import type { DataStore } from '../data-store.ts'
import type { ProviderStepName, StepName } from '../types.ts'
import { ProviderPrompt } from '../provider/provider-prompt.tsx'
import { Step } from './step.ts'

// A field of the provider form: its name, where return leads, where
// shift-tab and tab lead, and whether it is typed masked.
export abstract class ProviderStep extends Step {
  abstract readonly name: ProviderStepName
  abstract readonly next: StepName
  abstract readonly back: StepName | undefined
  abstract readonly forward: StepName | undefined
  readonly masked: boolean = false

  prompt(store: DataStore) {
    return <ProviderPrompt store={store} step={this} />
  }
}
