import { TaskState } from './task-state.ts'

export class GlobalDirectoryTaskState extends TaskState {
  label() {
    return this.task.label()
  }

  error() {
    return this.task.reason
  }
}
