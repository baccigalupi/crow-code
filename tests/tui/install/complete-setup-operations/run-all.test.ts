import { describe, expect, it, spyOn } from 'bun:test'
import { RunAll } from '../../../../src/tui/install/complete-setup-operations/run-all.ts'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { SetupProgressStore } from '../../../../src/tui/install/data-stores/setup-progress-store.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('RunAll', () => {
  it('when started, runs the first task', () => {
    const applicationData = mockApplicationData()
    const mkdir = spyOn(
      applicationData.filesystem,
      'mkdirWithParents',
    ).mockImplementation(() => new Promise<void>(() => {}))
    const store = new DataStore({ applicationData })
    const setup = new RunAll({
      applicationData,
      operationArguments: {
        inputs: store.inputs,
        step: store.step,
        progress: new SetupProgressStore(),
      },
    })

    setup.start()

    expect(mkdir).toHaveBeenCalledTimes(1)
  })

  it('when asked for its tasks, labels each one', () => {
    const applicationData = mockApplicationData()
    const store = new DataStore({ applicationData })
    const setup = new RunAll({
      applicationData,
      operationArguments: {
        inputs: store.inputs,
        step: store.step,
        progress: new SetupProgressStore(),
      },
    })

    const tasks = setup.tasks()

    expect(tasks[0].label()).toBe('Writing config to .crow/config.json')
    expect(tasks[1].label()).toBe('Creating ~/.crow')
  })

  it('when a task finishes, records it before the next one starts', async () => {
    const applicationData = mockApplicationData()
    const store = new DataStore({ applicationData })
    const progress = new SetupProgressStore()
    const finishedAtStart: number[] = []
    const setup = new RunAll({
      applicationData,
      operationArguments: { inputs: store.inputs, step: store.step, progress },
    })
    spyOn(applicationData.filesystem, 'mkdirWithParents').mockImplementation(
      () => {
        finishedAtStart.push(progress.finished.peek().length)
        return Promise.resolve()
      },
    )
    spyOn(applicationData.filesystem, 'writeTextFile').mockResolvedValue()
    setup.start()

    await setup.finished()

    expect(finishedAtStart).toEqual([0, 1])
    expect(progress.finished.peek()).toHaveLength(2)
    expect(progress.finished.peek()[1]).toBe(setup.tasks()[1])
  })

  it('when every task finishes, moves to done', async () => {
    const applicationData = mockApplicationData()
    spyOn(applicationData.filesystem, 'mkdirWithParents').mockResolvedValue()
    spyOn(applicationData.filesystem, 'writeTextFile').mockResolvedValue()
    const store = new DataStore({ applicationData })
    const setup = new RunAll({
      applicationData,
      operationArguments: {
        inputs: store.inputs,
        step: store.step,
        progress: new SetupProgressStore(),
      },
    })

    await setup.run()

    expect(store.step.current.peek()).toBe('done')
  })

  it('when a task fails, skips the rest and moves to done', async () => {
    const applicationData = mockApplicationData()
    const mkdir = spyOn(
      applicationData.filesystem,
      'mkdirWithParents',
    ).mockRejectedValue(new Error('permission denied'))
    spyOn(applicationData.filesystem, 'writeTextFile').mockResolvedValue()
    const store = new DataStore({ applicationData })
    const setup = new RunAll({
      applicationData,
      operationArguments: {
        inputs: store.inputs,
        step: store.step,
        progress: new SetupProgressStore(),
      },
    })

    await setup.run()

    expect(mkdir).toHaveBeenCalledTimes(1)
    expect(store.step.current.peek()).toBe('done')
  })

  it('when a task fails, records only the failed task as finished', async () => {
    const applicationData = mockApplicationData()
    spyOn(applicationData.filesystem, 'mkdirWithParents').mockRejectedValue(
      new Error('permission denied'),
    )
    const store = new DataStore({ applicationData })
    const progress = new SetupProgressStore()
    const setup = new RunAll({
      applicationData,
      operationArguments: { inputs: store.inputs, step: store.step, progress },
    })

    await setup.run()

    expect(progress.finished.peek()).toHaveLength(1)
    expect(progress.finished.peek()[0]).toBe(setup.tasks()[0])
  })
})
