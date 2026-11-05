import type { DataStore } from '../data-store.ts'
import { SetupProgress } from '../complete-setup/setup-progress.tsx'
import { RunSetup } from '../interactions/run-setup.ts'
import { Step } from './step.ts'

// Arriving here starts setup from the answers as they are now.
export class CompleteSetupStep extends Step {
  readonly name = 'completeSetup'

  prompt(store: DataStore) {
    return <SetupProgress store={store} />
  }

  entered(store: DataStore) {
    new RunSetup(store).start()
  }
}
