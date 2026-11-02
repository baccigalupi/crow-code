import { effect } from '@preact/signals-core'
import type { DataStore } from './data-store.ts'
import type { Layout } from './layout.ts'
import type { Panels } from './panels.ts'

// The install UI's only signal effects: each redraws one part of the layout
// from the store's values, run through the view model of the current panel.
// Once listening, every store change reaches the screen; dispose stops
// listening.
export class Subscriptions {
  private model: DataStore
  private layout: Pick<Layout, 'drawPreview' | 'drawPrompt'>
  private panels: Panels
  private stopListening: readonly (() => void)[] = []

  constructor(
    model: DataStore,
    layout: Pick<Layout, 'drawPreview' | 'drawPrompt'>,
    panels: Panels,
  ) {
    this.model = model
    this.layout = layout
    this.panels = panels
  }

  listen() {
    this.stopListening = [
      effect(() => this.drawPreview()),
      effect(() => this.drawPrompt()),
    ]
  }

  dispose() {
    this.stopListening.forEach((stop) => stop())
  }

  private drawPreview() {
    const { model, layout, panels } = this
    const { highlights } = panels.get(model.navigator.current.value)
    layout.drawPreview(panels.preview.props(model, highlights))
  }

  private drawPrompt() {
    const { model, layout, panels } = this
    const step = model.navigator.current.value
    layout.drawPrompt(step, panels.get(step).props(model))
  }
}
