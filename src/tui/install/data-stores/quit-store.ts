import { signal, type ReadonlySignal } from '@preact/signals-core'

// Whether the installer has asked to quit. The runner's listener destroys the
// renderer once it has.
export class QuitStore {
  private asked = signal(false)

  get requested(): ReadonlySignal<boolean> {
    return this.asked
  }

  request() {
    this.asked.value = true
  }
}
