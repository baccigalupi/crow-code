import type { SetupProgressValues, SetupTaskStatus } from '../../types.ts'

// The setup tasks as rows: each with the mark that says whether it is done,
// failed, running or still waiting.
export class SetupProgressViewModel {
  props({ setupTasks }: SetupProgressValues) {
    const active = this.activeIndex(setupTasks)
    return {
      rows: setupTasks.map((task, index) => ({
        ...task,
        indicator: this.indicator(task, index === active),
      })),
    }
  }

  // The first unfinished task is running, unless one has already failed.
  private activeIndex(setupTasks: readonly SetupTaskStatus[]) {
    if (setupTasks.some((task) => task.error)) return -1

    return setupTasks.findIndex((task) => !task.done)
  }

  private indicator(task: SetupTaskStatus, isActive: boolean) {
    if (task.error) {
      return '✗'
    } else if (task.done) {
      return '✓'
    } else {
      return this.pendingIndicator(isActive)
    }
  }

  private pendingIndicator(isActive: boolean) {
    if (isActive) {
      return '›'
    } else {
      return ' '
    }
  }
}
