import { computed, effect } from '@preact/signals-core'
import type { SetupStoreArguments, SetupTask } from '../types.ts'
import { memoize } from '../../../decorators.ts'
import { RunAll } from '../complete-setup-operations/run-all.ts'
import { SetupProgressStore } from './setup-progress-store.ts'

// The setup tasks. Once listening, setup starts when the step reaches
// completeSetup; dispose stops listening.
export class SetupStore {
  private setupArguments: SetupStoreArguments
  private progress = new SetupProgressStore()
  private stopListening = () => {}
  readonly tasks = computed(() =>
    this.runAll()
      .tasks()
      .map((task) => this.status(task)),
  )

  constructor(setupArguments: SetupStoreArguments) {
    this.setupArguments = setupArguments
  }

  listen() {
    this.stopListening = effect(() => this.startOnCompleteSetup())
  }

  finished() {
    return this.runAll().finished()
  }

  dispose() {
    this.stopListening()
  }

  private status(task: SetupTask) {
    return {
      id: task.constructor.name,
      label: task.label(),
      done: this.progress.finished.value.includes(task),
      error: task.reason,
    }
  }

  private startOnCompleteSetup() {
    if (this.setupArguments.step.current.value === 'completeSetup') {
      this.runAll().start()
    }
  }

  @memoize
  private runAll() {
    const { applicationData, inputs, step } = this.setupArguments
    const { progress } = this
    const operationArguments = { inputs, step, progress }
    return new RunAll({ applicationData, operationArguments })
  }
}
