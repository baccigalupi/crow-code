import type { RunAllArguments, SetupTask } from '../types.ts'
import { memoize } from '../../../decorators.ts'
import { Operation } from '../../../operation.ts'
import { GlobalDirectoryTask } from './global-directory.ts'
import { LocalConfigTask } from './local-config.ts'

export class RunAll extends Operation<RunAllArguments> {
  protected override logPrefix = 'Run all: '
  private running: Promise<unknown> = Promise.resolve()

  start() {
    this.running = this.run()
  }

  finished() {
    return this.running
  }

  async run() {
    await this.runTasks(this.tasks())
    this.operationArguments.step.goTo('done')
    return this
  }

  @memoize
  tasks() {
    const { applicationData } = this
    const { inputs, step } = this.operationArguments
    const operationArguments = { inputs, step }
    return [
      new LocalConfigTask({ applicationData, operationArguments }),
      new GlobalDirectoryTask({ applicationData, operationArguments }),
    ]
  }

  private async runTasks(tasks: readonly SetupTask[]) {
    if (tasks.length === 0 || !this.success()) return

    await this.runSubOperation(tasks[0])
    this.operationArguments.progress.finish(tasks[0])
    await this.runTasks(tasks.slice(1))
  }
}
