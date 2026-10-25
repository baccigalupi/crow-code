import { effect } from '@preact/signals-core'
import type {
  CompleteSetupArguments,
  InstallStore,
  SetupTask,
} from '../types.ts'

export class CompleteSetup {
  private installData: InstallStore
  private tasks: readonly SetupTask[]

  constructor({ installData, tasks }: CompleteSetupArguments) {
    this.installData = installData
    this.tasks = tasks
  }

  subscribe() {
    return effect(() => {
      if (this.installData.step.value === 'completeSetup') this.runFrom(0)
    })
  }

  private async runFrom(index: number) {
    if (index < this.tasks.length) {
      await this.tasks[index].run()
      await this.runFrom(index + 1)
    } else {
      this.installData.step.value = 'done'
    }
  }
}
