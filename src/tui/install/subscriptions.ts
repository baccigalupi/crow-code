import { effect } from '@preact/signals-core'
import type { DataStore } from './data-store.ts'
import type { InstallScreenViews } from './types.ts'

// The install UI's only signal effects: each redraws one view from the
// store's values. Once listening, every store change reaches the screen;
// dispose stops listening.
export class Subscriptions {
  private model: DataStore
  private screen: InstallScreenViews
  private stopListening: readonly (() => void)[] = []

  constructor(model: DataStore, screen: InstallScreenViews) {
    this.model = model
    this.screen = screen
  }

  listen() {
    const { model, screen } = this
    this.stopListening = [
      effect(() => screen.configPanel.update(model.inputs.value)),
      effect(() => screen.stepPrompts.update(model.stepValues.value)),
    ]
  }

  dispose() {
    this.stopListening.forEach((stop) => stop())
  }
}
