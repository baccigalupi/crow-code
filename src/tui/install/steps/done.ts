import type { DataStore } from '../data-store.ts'
import { DoneMessage } from '../views/steps/done-message.tsx'

export class DoneStep {
  private model: DataStore
  readonly name = 'done'
  readonly nextStep = 'done'
  readonly View = DoneMessage

  constructor(model: DataStore) {
    this.model = model
  }

  field() {
    return this.model.directories.envFile
  }
}
