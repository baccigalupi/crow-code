import { effect } from '@preact/signals-core'
import type { ApplicationData } from '../../../application-data/application-data.ts'
import type { CompleteSetupArguments, InstallStore } from '../types.ts'
import { memoize } from '../../../decorators.ts'
import { GlobalDirectoryTask } from './global-directory.ts'
import { LocalConfigTask } from './local-config.ts'

export class CompleteSetup {
  private applicationData: ApplicationData
  private installData: InstallStore
  private running: Promise<void>

  constructor({ applicationData, installData }: CompleteSetupArguments) {
    this.applicationData = applicationData
    this.installData = installData
    this.running = Promise.resolve()
  }

  subscribe() {
    return effect(() => {
      if (this.installData.step.value === 'completeSetup') this.start()
    })
  }

  finished() {
    return this.running
  }

  @memoize
  private tasks() {
    const taskArguments = this.taskArguments()
    return [
      new LocalConfigTask(taskArguments),
      new GlobalDirectoryTask(taskArguments),
    ]
  }

  private taskArguments() {
    const { applicationData, installData } = this
    return { applicationData, operationArguments: { installData } }
  }

  private start() {
    this.installData.setupTasks.value = this.tasks().map((task) => ({
      id: task.constructor.name,
      label: task.label(),
      done: false,
    }))
    this.running = this.runFrom(0)
  }

  private markDone(index: number) {
    this.installData.setupTasks.value = this.installData.setupTasks
      .peek()
      .map((status, position) => ({
        ...status,
        done: status.done || position === index,
      }))
  }

  private async runFrom(index: number) {
    if (index < this.tasks().length) {
      await this.tasks()[index].run()
      this.markDone(index)
      await this.runFrom(index + 1)
    } else {
      this.installData.step.value = 'done'
    }
  }
}
