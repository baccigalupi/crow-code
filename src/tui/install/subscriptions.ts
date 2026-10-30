import { effect } from '@preact/signals-core'
import type { DataStore } from './data-store.ts'
import type { InstallScreenViews } from './types.ts'
import type { InstallViewModels } from './view-models/install-view-models.ts'

// The install UI's only signal effects: each redraws one view from the
// store's values, run through the view model that decides what it draws.
// Once listening, every store change reaches the screen; dispose stops
// listening.
export class Subscriptions {
  private model: DataStore
  private screen: InstallScreenViews
  private viewModels: InstallViewModels
  private stopListening: readonly (() => void)[] = []

  constructor(
    model: DataStore,
    screen: InstallScreenViews,
    viewModels: InstallViewModels,
  ) {
    this.model = model
    this.screen = screen
    this.viewModels = viewModels
  }

  listen() {
    this.stopListening = [
      effect(() => this.drawConfigPanel()),
      effect(() => this.drawStepPrompts()),
    ]
  }

  dispose() {
    this.stopListening.forEach((stop) => stop())
  }

  private drawConfigPanel() {
    const { model, screen, viewModels } = this
    screen.configPanel.update(
      viewModels.configPanel().props(model.inputs.value),
    )
  }

  private drawStepPrompts() {
    const { model, screen, viewModels } = this
    const values = model.stepValues.value
    screen.stepPrompts.update(viewModels.stepPrompts().props(values))
  }
}
