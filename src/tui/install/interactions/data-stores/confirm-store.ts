import { signal, type ReadonlySignal } from '@preact/signals-core'

// The yes/no answer on the confirm prompt; yes until changed.
export class ConfirmStore {
  private answer = signal(true)

  get confirmed(): ReadonlySignal<boolean> {
    return this.answer
  }

  choose(answer: boolean) {
    this.answer.value = answer
  }
}
