import { describe, expect, it, spyOn } from 'bun:test'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { RunSetup } from '../../../../src/tui/install/interactions/run-setup.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('RunSetup', () => {
  it('when started, lists both tasks as pending', () => {
    const applicationData = mockApplicationData()
    spyOn(applicationData.filesystem, 'mkdirWithParents').mockImplementation(
      () => new Promise<void>(() => {}),
    )
    const store = new DataStore({ applicationData })

    new RunSetup(store).start()

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

  it('when started and setup succeeds, marks both tasks done and moves to done', async () => {
    const applicationData = mockApplicationData()
    spyOn(applicationData.filesystem, 'mkdirWithParents').mockResolvedValue()
    spyOn(applicationData.filesystem, 'writeTextFile').mockResolvedValue()
    const store = new DataStore({ applicationData })

    await new RunSetup(store).start()

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

  it('when started and a task fails, shows its error, skips the rest and still moves to done', async () => {
    const applicationData = mockApplicationData()
    spyOn(applicationData.filesystem, 'mkdirWithParents').mockRejectedValue(
      new Error('permission denied'),
    )
    const store = new DataStore({ applicationData })

    await new RunSetup(store).start()

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

  it('when started, setup uses the answers typed so far', () => {
    const applicationData = mockApplicationData()
    const mkdir = spyOn(
      applicationData.filesystem,
      'mkdirWithParents',
    ).mockImplementation(() => new Promise<void>(() => {}))
    const store = new DataStore({ applicationData })
    store.directories.repoDirectory.replace('/repo/x')

    new RunSetup(store).start()

    expect(mkdir.mock.calls).toEqual([['/repo/x']])
  })
})
