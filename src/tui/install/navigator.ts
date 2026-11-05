import { signal, type ReadonlySignal, type Signal } from '@preact/signals-core'
import type { NavigatorArguments } from './types.ts'

// Which step is showing, and the only way to move between steps. Arriving at
// a step is reported to entered.
export class Navigator<Name extends string> {
  private navigatorArguments: NavigatorArguments<Name>
  private position: Signal<Name>

  constructor(navigatorArguments: NavigatorArguments<Name>) {
    this.navigatorArguments = navigatorArguments
    this.position = signal(navigatorArguments.initial)
  }

  get current(): ReadonlySignal<Name> {
    return this.position
  }

  goTo(name: Name) {
    this.position.value = name
    this.navigatorArguments.entered(name)
  }
}
