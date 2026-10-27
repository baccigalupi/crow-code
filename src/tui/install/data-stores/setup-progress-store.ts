import { signal, type ReadonlySignal } from '@preact/signals-core'
import type { StatefulTask } from '../types.ts'

// Which setup tasks have run, in the order they finished.
export class SetupProgressStore {
  private finishedTasks = signal<readonly StatefulTask[]>([])

  get finished(): ReadonlySignal<readonly StatefulTask[]> {
    return this.finishedTasks
  }

  finish(task: StatefulTask) {
    this.finishedTasks.value = [...this.finishedTasks.value, task]
  }
}
