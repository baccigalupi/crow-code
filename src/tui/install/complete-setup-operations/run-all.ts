import { effect } from '@preact/signals-core'
import type { AsyncOperation } from '../../../types.ts'
import type { InstallStep, SetupTaskArguments } from '../types.ts'
import { memoize } from '../../../decorators.ts'
import { Operation } from '../../../operation.ts'
import { GlobalDirectoryTask } from './global-directory.ts'
import { LocalConfigTask } from './local-config.ts'

export class RunAll extends Operation<SetupTaskArguments> {
  protected override logPrefix = 'Run all: '
  private running: Promise<unknown> = Promise.resolve()

  subscribe() {
    return effect(() => {
      if (this.step() === 'completeSetup') this.start()
    })
  }

  finished() {
    return this.running
  }

  taskStates() {
    return this.tasks().map((task) => task.state)
  }

  async run() {
    await this.runTasks(this.tasks())
    this.setStep('done')
    return this
  }

  private async runTasks(tasks: readonly AsyncOperation[]) {
    if (tasks.length === 0) return

    await this.runSubOperation(tasks[0])
    await this.runTasks(tasks.slice(1))
  }

  private step() {
    return this.operationArguments.userInputStore.step.value
  }

  private setStep(step: InstallStep) {
    this.operationArguments.userInputStore.step.value = step
  }

  @memoize
  private tasks() {
    const { applicationData, operationArguments } = this
    return [
      new LocalConfigTask({ applicationData, operationArguments }),
      new GlobalDirectoryTask({ applicationData, operationArguments }),
    ]
  }

  private start() {
    this.running = this.run()
  }
}
