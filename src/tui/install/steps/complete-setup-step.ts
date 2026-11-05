import type { DataStore } from '../data-store.ts'
import { RunSetup } from '../interactions/run-setup.ts'
import { Step } from './step.ts'

// Arriving here starts setup from the answers as they are now.
export class CompleteSetupStep extends Step {
  readonly name = 'completeSetup'

  entered(store: DataStore) {
    new RunSetup(store).start()
  }
}
