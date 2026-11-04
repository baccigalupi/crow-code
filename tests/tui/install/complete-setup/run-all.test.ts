import { describe, expect, it, mock, spyOn } from 'bun:test'
import { RunAll } from '../../../../src/tui/install/complete-setup/run-all.ts'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('RunAll', () => {
  it('when run, starts the first task', () => {
    const applicationData = mockApplicationData()
    const mkdir = spyOn(
      applicationData.filesystem,
      'mkdirWithParents',
    ).mockImplementation(() => new Promise<void>(() => {}))
    const store = new DataStore({ applicationData })
    const setup = new RunAll({
      applicationData,
      operationArguments: {
        inputs: store.inputs.peek(),
        globalDirectory: '~/.crow',
        finished: mock(),
      },
    })

    setup.run()

    expect(mkdir).toHaveBeenCalledTimes(1)
  })

  it('when asked for its tasks, labels each one', () => {
    const applicationData = mockApplicationData()
    const store = new DataStore({ applicationData })
    const setup = new RunAll({
      applicationData,
      operationArguments: {
        inputs: store.inputs.peek(),
        globalDirectory: '~/.crow',
        finished: mock(),
      },
    })

    const tasks = setup.tasks()

    expect(tasks[0].label()).toBe('Writing config to .crow/config.json')
    expect(tasks[1].label()).toBe('Creating ~/.crow')
  })

  it('when a task finishes, reports it before the next one starts', async () => {
    const applicationData = mockApplicationData()
    const store = new DataStore({ applicationData })
    const finished = mock()
    const finishedAtStart: number[] = []
    const setup = new RunAll({
      applicationData,
      operationArguments: {
        inputs: store.inputs.peek(),
        globalDirectory: '~/.crow',
        finished,
      },
    })
    spyOn(applicationData.filesystem, 'mkdirWithParents').mockImplementation(
      () => {
        finishedAtStart.push(finished.mock.calls.length)
        return Promise.resolve()
      },
    )
    spyOn(applicationData.filesystem, 'writeTextFile').mockResolvedValue()

    await setup.run()

    expect(finishedAtStart).toEqual([0, 1])
    expect(finished.mock.calls).toEqual([
      [setup.tasks()[0]],
      [setup.tasks()[1]],
    ])
  })

  it('when every task finishes, the operation succeeds', async () => {
    const applicationData = mockApplicationData()
    spyOn(applicationData.filesystem, 'mkdirWithParents').mockResolvedValue()
    spyOn(applicationData.filesystem, 'writeTextFile').mockResolvedValue()
    const store = new DataStore({ applicationData })
    const setup = new RunAll({
      applicationData,
      operationArguments: {
        inputs: store.inputs.peek(),
        globalDirectory: '~/.crow',
        finished: mock(),
      },
    })

    await setup.run()

    expect(setup.success()).toBe(true)
  })

  it('when a task fails, skips the rest and reports only the failed task', async () => {
    const applicationData = mockApplicationData()
    const mkdir = spyOn(
      applicationData.filesystem,
      'mkdirWithParents',
    ).mockRejectedValue(new Error('permission denied'))
    const store = new DataStore({ applicationData })
    const finished = mock()
    const setup = new RunAll({
      applicationData,
      operationArguments: {
        inputs: store.inputs.peek(),
        globalDirectory: '~/.crow',
        finished,
      },
    })

    await setup.run()

    expect(mkdir).toHaveBeenCalledTimes(1)
    expect(setup.success()).toBe(false)
    expect(finished.mock.calls).toEqual([[setup.tasks()[0]]])
  })
})
