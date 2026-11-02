import type { SetupTaskStatus } from '../../types.ts'
import type { SetupProgressViewModel } from '../shared/setup-progress-view-model.ts'

type SetupProgressValues = {
  readonly setupTasks: readonly SetupTaskStatus[]
}

// The finished setup rows, then the hint that says how it ended.
export class DoneMessageViewModel {
  private progress: SetupProgressViewModel

  constructor(progress: SetupProgressViewModel) {
    this.progress = progress
  }

  props(values: SetupProgressValues) {
    return { ...this.progress.props(values), hint: this.hint(values) }
  }

  private hint({ setupTasks }: SetupProgressValues) {
    if (setupTasks.some((task) => task.error)) {
      return 'Setup failed. Press any key to exit'
    } else {
      return 'Done! Press any key to exit'
    }
  }
}
