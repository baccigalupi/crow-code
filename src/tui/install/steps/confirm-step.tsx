import type { DataStore } from '../data-store.ts'
import { ConfirmPrompt } from '../confirm/confirm-prompt.tsx'
import { Step } from './step.ts'

export class ConfirmStep extends Step {
  readonly name = 'confirm'

  prompt(store: DataStore) {
    return <ConfirmPrompt store={store} />
  }
}
