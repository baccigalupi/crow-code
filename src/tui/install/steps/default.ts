import type { UserInputStore } from '../types.ts'

export class DefaultStep {
  private userInputStore: UserInputStore
  readonly name = 'default'
  readonly nextStep = 'confirm'
  readonly View = () => null

  constructor(userInputStore: UserInputStore) {
    this.userInputStore = userInputStore
  }

  state() {
    return this.userInputStore.envFile
  }
}
