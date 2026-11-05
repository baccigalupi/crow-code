import type { DataStore } from '../data-store.ts'
import { ConfirmPrompt } from './prompt.tsx'

export class ConfirmPanel {
  readonly name = 'confirm'
  readonly next = 'completeSetup'
  readonly entered = undefined

  prompt(store: DataStore) {
    return <ConfirmPrompt panel={this} store={store} />
  }
}
