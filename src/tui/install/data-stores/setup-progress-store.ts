import { signal, type ReadonlySignal } from '@preact/signals-core'
import type { SetupTaskStatus } from '../types.ts'

// The setup tasks and which of them have finished, with the error each
// finished task reported.
export class SetupProgressStore {
  private statuses = signal<readonly SetupTaskStatus[]>([])

  get tasks(): ReadonlySignal<readonly SetupTaskStatus[]> {
    return this.statuses
  }

  list(tasks: readonly SetupTaskStatus[]) {
    this.statuses.value = tasks
  }

  finish(id: string, error: string) {
    this.statuses.value = this.statuses.value.map((status) =>
      this.finished(status, id, error),
    )
  }

  private finished(status: SetupTaskStatus, id: string, error: string) {
    if (status.id !== id) return status

    return { ...status, done: true, error }
  }
}
