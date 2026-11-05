import {
  batch,
  signal,
  type ReadonlySignal,
  type Signal,
} from '@preact/signals-core'
import type { Keypress } from './keypress.ts'
import type {
  Controller,
  ExitApp,
  NavigatorArguments,
  Outcome,
  PanelFlow,
} from './types.ts'

// Which panel is showing, and the only way to move between panels. A key goes
// to the current panel's controller; the outcome it returns is applied here.
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
    this.enter(this.panel())
  }

  private enter(panel: PanelFlow<Name>) {
    if (panel.entered === undefined) return

    panel.entered(this)
  }

  press(keypress: Keypress, exit: ExitApp) {
    batch(() => this.dispatch(keypress, exit))
  }

  private dispatch(keypress: Keypress, exit: ExitApp) {
    if (keypress.isQuit()) exit()
    else this.apply(this.outcome(this.panel().controller, keypress), exit)
  }

  // A panel with no controller takes no input, so its keys change nothing.
  private outcome(
    controller: Controller<Name> | undefined,
    keypress: Keypress,
  ): Outcome<Name> {
    if (controller === undefined) return 'stay'

    return controller.handle(keypress)
  }

  private apply(outcome: Outcome<Name>, exit: ExitApp) {
    const panel = this.panel()
    if (outcome === 'next') this.goToTarget(panel.next)
    else if (outcome === 'cancel') this.goToTarget(panel.cancel)
    else if (outcome === 'exit') exit()
    else if (outcome !== 'stay') this.goTo(outcome.goTo)
  }

  private goToTarget(target: Name | undefined) {
    if (target === undefined) return

    this.goTo(target)
  }

  private panel() {
    return this.panels[this.position.peek()]
  }
}
