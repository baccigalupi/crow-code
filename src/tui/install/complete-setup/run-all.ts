import type { RunAllArguments, SetupTask } from '../types.ts'
import { memoize } from '../../../decorators.ts'
import { Operation } from '../../../operation.ts'
import { GlobalDirectoryTask } from './run-all/global-directory-task.ts'
import { LocalConfigTask } from './run-all/local-config-task.ts'

// Runs the setup tasks one after another, reporting each as it finishes. A
// failed task is reported too, and the tasks after it are skipped.
export class RunAll extends Operation<RunAllArguments> {
  protected override logPrefix = 'Run all: '

  async run() {
    await this.runTasks(this.tasks())
    return this
  }

  @memoize
  tasks() {
    const { applicationData } = this
    const { inputs } = this.operationArguments
    const operationArguments = { inputs }
    return [
      new LocalConfigTask({ applicationData, operationArguments }),
      new GlobalDirectoryTask({ applicationData, operationArguments }),
    ]
  }

  private async runTasks(tasks: readonly SetupTask[]) {
    if (tasks.length === 0 || !this.success()) return

    await this.runSubOperation(tasks[0])
    this.operationArguments.finished(tasks[0])
    await this.runTasks(tasks.slice(1))
  }
}
