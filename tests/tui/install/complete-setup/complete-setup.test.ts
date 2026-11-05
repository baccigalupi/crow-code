import { describe, expect, it, spyOn } from 'bun:test'
import { testRender } from '@opentui/react/test-utils'
import { act } from 'react'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { CompleteSetupPanel } from '../../../../src/tui/install/complete-setup/complete-setup.tsx'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('CompleteSetupPanel', () => {
  it('when asked, names itself', () => {
    const panel = new CompleteSetupPanel()

    const { name } = panel

    expect(name).toBe('completeSetup')
  })

  it('when asked for its prompt, renders the setup rows', async () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    store.progress.list([
      {
        id: 'LocalConfigTask',
        label: 'Writing config to .crow/config.json',
        done: false,
        error: '',
      },
    ])
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      new CompleteSetupPanel().prompt(store),
      { width: 50, height: 3 },
    )

    await renderOnce()

    expect(captureCharFrame()).toContain(
      '› Writing config to .crow/config.json',
    )
    act(() => renderer.destroy())
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
