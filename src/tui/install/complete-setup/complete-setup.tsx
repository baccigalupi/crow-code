import type { Navigator } from '../../navigator.ts'
import type { DataStore } from '../data-store.ts'
import type { PanelName, StatefulTask } from '../types.ts'
import { RunAll } from './run-all.ts'
import { IdleController } from './idle-controller.ts'
import { SetupProgress } from './setup-progress.tsx'

export class CompleteSetupPanel {
  readonly name = 'completeSetup'
  readonly next = undefined
  readonly cancel = undefined
  readonly highlights = { key: 'completeSetup' }

  controller(_store: DataStore) {
    return new IdleController('stay')
  }

  prompt(store: DataStore) {
    return <SetupProgress store={store} />
  }

  // Arriving here starts setup from the answers as they are now; when it is
  // over, successfully or not, the installer moves on to done.
  entered(store: DataStore, navigator: Navigator<PanelName>) {
    const runAll = this.runAll(store)
    store.progress.list(runAll.tasks().map((task) => this.pending(task)))
    return this.runThenFinish(runAll, navigator)
  }

  private async runThenFinish(runAll: RunAll, navigator: Navigator<PanelName>) {
    await runAll.run()
    navigator.goTo('done')
  }

  private runAll(store: DataStore) {
    const { applicationData } = store
    const inputs = store.inputs.peek()
    const globalDirectory = store.directories.globalPath.peek()
    const finished = (task: StatefulTask) => this.finish(store, task)
    return new RunAll({
      applicationData,
      operationArguments: { inputs, globalDirectory, finished },
    })
  }

  private finish(store: DataStore, task: StatefulTask) {
    store.progress.finish(task.constructor.name, task.reason)
  }

  private pending(task: StatefulTask) {
    const id = task.constructor.name
    return { id, label: task.label(), done: false, error: '' }
  }
}
