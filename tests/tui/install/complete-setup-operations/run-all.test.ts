import { describe, expect, it, spyOn } from 'bun:test'
import { RunAll } from '../../../../src/tui/install/complete-setup-operations/run-all.ts'
import { buildUserInputStore } from '../../../support/user-input-store.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('RunAll', () => {
  it('when the step becomes completeSetup, starts the first task', () => {
    const userInputStore = buildUserInputStore()
    userInputStore.step.value = 'confirm'
    const applicationData = mockApplicationData()
    const mkdir = spyOn(
      applicationData.filesystem,
      'mkdirWithParents',
    ).mockImplementation(() => new Promise<void>(() => {}))
    const dispose = new RunAll({
      applicationData,
      operationArguments: { userInputStore },
    }).subscribe()

    userInputStore.step.value = 'completeSetup'

    expect(mkdir).toHaveBeenCalledTimes(1)
    dispose()
  })

  it('when asked for task states, returns every task as pending', () => {
    const userInputStore = buildUserInputStore()
    const setup = new RunAll({
      applicationData: mockApplicationData(),
      operationArguments: { userInputStore },
    })

    const taskStates = setup.taskStates()

    expect(taskStates[0].status()).toEqual({
      id: 'LocalConfigTaskState',
      label: 'Writing config to .crow/config.json',
      done: false,
      error: '',
    })
    expect(taskStates[1].status()).toEqual({
      id: 'GlobalDirectoryTaskState',
      label: 'Creating ~/.crow',
      done: false,
      error: '',
    })
  })

  it('when a task finishes, completes it before the next one starts', async () => {
    const userInputStore = buildUserInputStore()
    userInputStore.step.value = 'confirm'
    const applicationData = mockApplicationData()
    const firstDoneAtStart: boolean[] = []
    const setup = new RunAll({
      applicationData,
      operationArguments: { userInputStore },
    })
    spyOn(applicationData.filesystem, 'mkdirWithParents').mockImplementation(
      () => {
        firstDoneAtStart.push(setup.taskStates()[0].done.peek())
        return Promise.resolve()
      },
    )
    spyOn(applicationData.filesystem, 'writeTextFile').mockResolvedValue()
    const dispose = setup.subscribe()

    userInputStore.step.value = 'completeSetup'
    await setup.finished()

    expect(firstDoneAtStart).toEqual([false, true])
    expect(setup.taskStates()[1].done.peek()).toBe(true)
    dispose()
  })

  it('when every task finishes, moves to done', async () => {
    const userInputStore = buildUserInputStore()
    userInputStore.step.value = 'confirm'
    const applicationData = mockApplicationData()
    spyOn(applicationData.filesystem, 'mkdirWithParents').mockResolvedValue()
    spyOn(applicationData.filesystem, 'writeTextFile').mockResolvedValue()
    const setup = new RunAll({
      applicationData,
      operationArguments: { userInputStore },
    })
    const dispose = setup.subscribe()

    userInputStore.step.value = 'completeSetup'
    await setup.finished()

    expect(userInputStore.step.peek()).toBe('done')
    dispose()
  })

  it('when a task fails, skips the rest and moves to done', async () => {
    const userInputStore = buildUserInputStore()
    userInputStore.step.value = 'confirm'
    const applicationData = mockApplicationData()
    const mkdir = spyOn(
      applicationData.filesystem,
      'mkdirWithParents',
    ).mockRejectedValue(new Error('permission denied'))
    spyOn(applicationData.filesystem, 'writeTextFile').mockResolvedValue()
    const setup = new RunAll({
      applicationData,
      operationArguments: { userInputStore },
    })
    const dispose = setup.subscribe()

    userInputStore.step.value = 'completeSetup'
    await setup.finished()

    expect(mkdir).toHaveBeenCalledTimes(1)
    expect(userInputStore.step.peek()).toBe('done')
    dispose()
  })

  it('when a task fails, completes its state with the error', async () => {
    const userInputStore = buildUserInputStore()
    userInputStore.step.value = 'confirm'
    const applicationData = mockApplicationData()
    spyOn(applicationData.filesystem, 'mkdirWithParents').mockRejectedValue(
      new Error('permission denied'),
    )
    const setup = new RunAll({
      applicationData,
      operationArguments: { userInputStore },
    })
    const dispose = setup.subscribe()

    userInputStore.step.value = 'completeSetup'
    await setup.finished()

    expect(setup.taskStates()[0].status()).toEqual({
      id: 'LocalConfigTaskState',
      label: 'Writing config to .crow/config.json',
      done: true,
      error: 'could not write .crow/config.json: permission denied',
    })
    dispose()
  })

  it('when the step is not completeSetup, starts no task', () => {
    const userInputStore = buildUserInputStore()
    userInputStore.step.value = 'envFile'
    const applicationData = mockApplicationData()
    const mkdir = spyOn(applicationData.filesystem, 'mkdirWithParents')
    const dispose = new RunAll({
      applicationData,
      operationArguments: { userInputStore },
    }).subscribe()

    userInputStore.step.value = 'confirm'

    expect(mkdir).not.toHaveBeenCalled()
    expect(userInputStore.step.peek()).toBe('confirm')
    dispose()
  })
})
