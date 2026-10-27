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
    const { inputs, step, directories } = new DataStore({ applicationData })
    directories.repoDirectory.insert('/repo/x')
    new SetupStore({ applicationData, inputs, step }).listen()

    step.goTo('completeSetup')

    expect(mkdir.mock.calls).toEqual([['/repo/x']])
  })

  it('when not listening, reaching completeSetup starts nothing', () => {
    const applicationData = mockApplicationData()
    const mkdir = spyOn(applicationData.filesystem, 'mkdirWithParents')
    const { inputs, step } = new DataStore({ applicationData })
    new SetupStore({ applicationData, inputs, step })

    step.goTo('completeSetup')

    expect(mkdir).not.toHaveBeenCalled()
  })

  it('when disposed before listening, then listening, still starts setup', () => {
    const applicationData = mockApplicationData()
    const mkdir = spyOn(
      applicationData.filesystem,
      'mkdirWithParents',
    ).mockImplementation(() => new Promise<void>(() => {}))
    const { inputs, step } = new DataStore({ applicationData })
    const setup = new SetupStore({ applicationData, inputs, step })
    setup.dispose()
    setup.listen()

    step.goTo('completeSetup')

    expect(mkdir.mock.calls).toEqual([['.crow']])
  })

  it('when disposed, no longer starts setup', () => {
    const applicationData = mockApplicationData()
    const mkdir = spyOn(
      applicationData.filesystem,
      'mkdirWithParents',
    ).mockImplementation(() => new Promise<void>(() => {}))
    const { inputs, step } = new DataStore({ applicationData })
    const setup = new SetupStore({ applicationData, inputs, step })
    setup.listen()
    setup.dispose()

    step.goTo('completeSetup')

    expect(mkdir.mock.calls).toEqual([])
  })

  it('when built, lists every task as pending', () => {
    const applicationData = mockApplicationData()
    const { inputs, step } = new DataStore({ applicationData })
    const setup = new SetupStore({ applicationData, inputs, step })

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
    const { inputs, step } = new DataStore({ applicationData })
    const setup = new SetupStore({ applicationData, inputs, step })
    setup.listen()
    step.goTo('completeSetup')

    await setup.finished()

    expect(setup.tasks.peek()[0].done).toBe(true)
    expect(setup.tasks.peek()[1].done).toBe(true)
    expect(step.current.peek()).toBe('done')
  })

  it('when a task fails, shows its error', async () => {
    const applicationData = mockApplicationData()
    spyOn(applicationData.filesystem, 'mkdirWithParents').mockRejectedValue(
      new Error('permission denied'),
    )
    const { inputs, step } = new DataStore({ applicationData })
    const setup = new SetupStore({ applicationData, inputs, step })
    setup.listen()
    step.goTo('completeSetup')

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
    const { inputs, step } = new DataStore({ applicationData })
    new SetupStore({ applicationData, inputs, step }).listen()

    step.goTo('confirm')

    expect(mkdir).not.toHaveBeenCalled()
  })
})
