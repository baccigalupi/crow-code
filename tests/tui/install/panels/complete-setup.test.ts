import { describe, expect, it, spyOn } from 'bun:test'
import { Keypress } from '../../../../src/tui/keypress.ts'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { CompleteSetupPanel } from '../../../../src/tui/install/panels/complete-setup.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('CompleteSetupPanel', () => {
  it('when asked, names itself and has nowhere to go next', () => {
    const panel = new CompleteSetupPanel()

    const { name } = panel

    expect(name).toBe('completeSetup')
    expect(panel.next).toBeUndefined()
    expect(panel.cancel).toBeUndefined()
  })

  it('when any key is pressed, its controller stays', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const controller = new CompleteSetupPanel().controller(store)

    const outcome = controller.handle(new Keypress('x', {}))

    expect(outcome).toBe('stay')
  })

  it('when no setup task has run, its view model has no rows', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })

    const props = new CompleteSetupPanel().props(store)

    expect(props).toEqual({ rows: [] })
  })

  it('when entered, lists both tasks as pending', () => {
    const applicationData = mockApplicationData()
    spyOn(applicationData.filesystem, 'mkdirWithParents').mockImplementation(
      () => new Promise<void>(() => {}),
    )
    const store = new DataStore({ applicationData })

    new CompleteSetupPanel().entered(store, store.navigator)

    expect(store.progress.tasks.peek()).toEqual([
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

  it('when entered and setup succeeds, marks both tasks done and moves to done', async () => {
    const applicationData = mockApplicationData()
    spyOn(applicationData.filesystem, 'mkdirWithParents').mockResolvedValue()
    spyOn(applicationData.filesystem, 'writeTextFile').mockResolvedValue()
    const store = new DataStore({ applicationData })

    await new CompleteSetupPanel().entered(store, store.navigator)

    expect(store.progress.tasks.peek()).toEqual([
      {
        id: 'LocalConfigTask',
        label: 'Writing config to .crow/config.json',
        done: true,
        error: '',
      },
      {
        id: 'GlobalDirectoryTask',
        label: 'Creating ~/.crow',
        done: true,
        error: '',
      },
    ])
    expect(store.navigator.current.peek()).toBe('done')
  })

  it('when entered and a task fails, shows its error, skips the rest and still moves to done', async () => {
    const applicationData = mockApplicationData()
    spyOn(applicationData.filesystem, 'mkdirWithParents').mockRejectedValue(
      new Error('permission denied'),
    )
    const store = new DataStore({ applicationData })

    await new CompleteSetupPanel().entered(store, store.navigator)

    expect(store.progress.tasks.peek()).toEqual([
      {
        id: 'LocalConfigTask',
        label: 'Writing config to .crow/config.json',
        done: true,
        error: 'could not write .crow/config.json: permission denied',
      },
      {
        id: 'GlobalDirectoryTask',
        label: 'Creating ~/.crow',
        done: false,
        error: '',
      },
    ])
    expect(store.navigator.current.peek()).toBe('done')
  })

  it('when entered, setup uses the answers typed so far', () => {
    const applicationData = mockApplicationData()
    const mkdir = spyOn(
      applicationData.filesystem,
      'mkdirWithParents',
    ).mockImplementation(() => new Promise<void>(() => {}))
    const store = new DataStore({ applicationData })
    store.directories.repoDirectory.insert('/repo/x')

    new CompleteSetupPanel().entered(store, store.navigator)

    expect(mkdir.mock.calls).toEqual([['/repo/x']])
  })
})
