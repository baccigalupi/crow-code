import { computed, signal, type ReadonlySignal } from '@preact/signals-core'
import type { SetupTaskRow, SetupTaskStatus } from '../types.ts'

// The setup tasks and which of them have finished, with the error each
// finished task reported. Rows add the state each task is drawn in: the first
// unfinished task runs, unless one has already failed.
export class SetupProgressStore {
  private statuses = signal<readonly SetupTaskStatus[]>([])
  readonly rows = computed(() => this.rowsFor(this.statuses.value))

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

  private rowsFor(tasks: readonly SetupTaskStatus[]): SetupTaskRow[] {
    const running = this.runningIndex(tasks)
    return tasks.map((task, index) => ({
      ...task,
      state: this.state(task, index === running),
    }))
  }

  private runningIndex(tasks: readonly SetupTaskStatus[]) {
    if (tasks.some((task) => task.error)) return -1

    return tasks.findIndex((task) => !task.done)
  }

  private state(task: SetupTaskStatus, running: boolean) {
    if (task.done) return this.finishedState(task)

    return this.unfinishedState(running)
  }

  private finishedState(task: SetupTaskStatus) {
    if (task.error) return 'failed'

    return 'done'
  }

  private unfinishedState(running: boolean) {
    if (running) return 'running'

    return 'waiting'
  }
}
