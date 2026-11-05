import { signal, type ReadonlySignal, type Signal } from '@preact/signals-core'
import type { NavigatorArguments, PanelFlow } from './types.ts'

// Which panel is showing, and the only way to move between panels.
export class Navigator<Name extends string> {
  private panels: Readonly<Record<string, PanelFlow<Name>>>
  private position: Signal<Name>

  constructor({ initial, panels }: NavigatorArguments<Name>) {
    this.panels = panels
    this.position = signal(initial)
  }

  get current(): ReadonlySignal<Name> {
    return this.position
  }

  goTo(name: Name) {
    this.position.value = name
    this.enter(this.panels[name])
  }

  private enter(panel: PanelFlow<Name>) {
    if (panel.entered === undefined) return

    panel.entered(this)
  }
}
