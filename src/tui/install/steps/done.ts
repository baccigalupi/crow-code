import type { UserInputStore } from '../types.ts'
import { DoneMessage } from '../views/steps/done-message.tsx'

export class DoneStep {
  private userInputStore: UserInputStore
  readonly name = 'done'
  readonly nextStep = 'done'
  readonly View = DoneMessage

  constructor(userInputStore: UserInputStore) {
    this.userInputStore = userInputStore
  }

  state() {
    return this.userInputStore.envFile
  }
}
