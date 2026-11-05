import type { DataStore } from '../data-store.ts'
import type { StatefulTask } from '../types.ts'
import { RunAll } from './run-setup/run-all.ts'

// Setup from the answers as they are now: lists every task as pending, runs
// them, and moves on to done when it is over, successfully or not.
export class RunSetup {
  private store: DataStore

  constructor(store: DataStore) {
    this.store = store
  }

  start() {
    const runAll = this.runAll()
    this.store.progress.list(runAll.tasks().map((task) => this.pending(task)))
    return this.runThenFinish(runAll)
  }

  private async runThenFinish(runAll: RunAll) {
    await runAll.run()
    this.store.navigator.goTo('done')
  }

  private runAll() {
    const { applicationData } = this.store
    return new RunAll({
      applicationData,
      operationArguments: this.answers(),
    })
  }

  // The answers as they are now, and where finished tasks report.
  private answers() {
    const inputs = this.store.inputs.peek()
    const globalDirectory = this.store.directories.globalPath.peek()
    const finished = (task: StatefulTask) => this.finish(task)
    return { inputs, globalDirectory, finished }
  }

  private finish(task: StatefulTask) {
    this.store.progress.finish(task.constructor.name, task.reason)
  }

  private pending(task: StatefulTask) {
    const id = task.constructor.name
    return { id, label: task.label(), done: false, error: '' }
  }
}
