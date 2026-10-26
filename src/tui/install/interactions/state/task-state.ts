import { signal, type Signal } from '@preact/signals-core'
import type { StatefulTask } from '../../types.ts'

// What the views know about one setup task. Inheritors say how the task is
// labelled and what went wrong; `complete` flips `done` once it has run,
// whether or not it succeeded.
export abstract class TaskState {
  protected task: StatefulTask
  done: Signal<boolean>

  constructor(task: StatefulTask) {
    this.task = task
    this.done = signal(false)
  }

  abstract label(): string

  abstract error(): string

  complete() {
    this.done.value = true
  }

  get id() {
    return this.constructor.name
  }

  status() {
    return {
      id: this.id,
      label: this.label(),
      done: this.done.value,
      error: this.error(),
    }
  }
}
