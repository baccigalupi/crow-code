import type { DataStore } from '../data-store.ts'
import { DoneMessage } from '../done/done-message.tsx'
import { Step } from './step.ts'

export class DoneStep extends Step {
  readonly name = 'done'

  prompt(store: DataStore) {
    return <DoneMessage store={store} />
  }
}
