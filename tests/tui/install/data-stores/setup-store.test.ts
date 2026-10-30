import { describe, expect, it, spyOn } from 'bun:test'
import { SetupStore } from '../../../../src/tui/install/data-stores/setup-store.ts'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('SetupStore', () => {
  it('when the step reaches completeSetup, starts setup from the inputs', () => {
    const applicationData = mockApplicationData()
    const mkdir = spyOn(
      applicationData.filesystem,
      'mkdirWithParents',
    ).mockImplementation(() => new Promise<void>(() => {}))
    const { inputs, navigator, directories } = new DataStore({
      applicationData,
    })
    directories.repoDirectory.insert('/repo/x')
    new SetupStore({ applicationData, inputs, navigator }).listen()

    navigator.goTo('completeSetup')

    expect(mkdir.mock.calls).toEqual([['/repo/x']])
  })

  it('when not listening, reaching completeSetup starts nothing', () => {
    const applicationData = mockApplicationData()
    const mkdir = spyOn(applicationData.filesystem, 'mkdirWithParents')
    const { inputs, navigator } = new DataStore({ applicationData })
    new SetupStore({ applicationData, inputs, navigator })

    navigator.goTo('completeSetup')

    expect(mkdir).not.toHaveBeenCalled()
  })

  it('when disposed before listening, then listening, still starts setup', () => {
    const applicationData = mockApplicationData()
    const mkdir = spyOn(
      applicationData.filesystem,
      'mkdirWithParents',
    ).mockImplementation(() => new Promise<void>(() => {}))
    const { inputs, navigator } = new DataStore({ applicationData })
    const setup = new SetupStore({ applicationData, inputs, navigator })
    setup.dispose()
    setup.listen()

    navigator.goTo('completeSetup')

    expect(mkdir.mock.calls).toEqual([['.crow']])
  })

  it('when disposed, no longer starts setup', () => {
    const applicationData = mockApplicationData()
    const mkdir = spyOn(
      applicationData.filesystem,
      'mkdirWithParents',
    ).mockImplementation(() => new Promise<void>(() => {}))
    const { inputs, navigator } = new DataStore({ applicationData })
    const setup = new SetupStore({ applicationData, inputs, navigator })
    setup.listen()
    setup.dispose()

    navigator.goTo('completeSetup')

    expect(mkdir.mock.calls).toEqual([])
  })

  it('when built, lists every task as pending', () => {
    const applicationData = mockApplicationData()
    const { inputs, navigator } = new DataStore({ applicationData })
    const setup = new SetupStore({ applicationData, inputs, navigator })

    const tasks = setup.tasks.peek()

    expect(tasks).toEqual([
      {
        id: 'LocalConfigTask',
        label: 'Writing config to .crow/config.json',
        done: false,
        error: '',
      },
      {
        id: 'GlobalDirectoryTask',
        label: 'Creating ~/.crow',
        done: false,
        error: '',
      },
    ])
  })

  it('when setup finishes, lists every task as done and moves to done', async () => {
    const applicationData = mockApplicationData()
    spyOn(applicationData.filesystem, 'mkdirWithParents').mockResolvedValue()
    spyOn(applicationData.filesystem, 'writeTextFile').mockResolvedValue()
    const { inputs, navigator } = new DataStore({ applicationData })
    const setup = new SetupStore({ applicationData, inputs, navigator })
    setup.listen()
    navigator.goTo('completeSetup')

    await setup.finished()

    expect(setup.tasks.peek()[0].done).toBe(true)
    expect(setup.tasks.peek()[1].done).toBe(true)
    expect(navigator.current.peek()).toBe('done')
  })

  it('when a task fails, shows its error', async () => {
    const applicationData = mockApplicationData()
    spyOn(applicationData.filesystem, 'mkdirWithParents').mockRejectedValue(
      new Error('permission denied'),
    )
    const { inputs, navigator } = new DataStore({ applicationData })
    const setup = new SetupStore({ applicationData, inputs, navigator })
    setup.listen()
    navigator.goTo('completeSetup')

    await setup.finished()

    expect(setup.tasks.peek()[0]).toEqual({
      id: 'LocalConfigTask',
      label: 'Writing config to .crow/config.json',
      done: true,
      error: 'could not write .crow/config.json: permission denied',
    })
  })

  it('when the step is not completeSetup, starts nothing', () => {
    const applicationData = mockApplicationData()
    const mkdir = spyOn(applicationData.filesystem, 'mkdirWithParents')
    const { inputs, navigator } = new DataStore({ applicationData })
    new SetupStore({ applicationData, inputs, navigator }).listen()

    navigator.goTo('confirm')

    expect(mkdir).not.toHaveBeenCalled()
  })
})
