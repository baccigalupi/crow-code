import { describe, expect, it, spyOn } from 'bun:test'
import { DataStore } from '../../../src/tui/install/data-store.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'

describe('DataStore', () => {
  it('when a directory is typed, inputs include the typed directory', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })

    store.directories.repoDirectory.replace('/r')

    expect(store.inputs.peek().repoDirectory).toBe('/r')
  })

  it('when a provider is committed, inputs list the provider', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    store.providerEditForm.providerName.replace('Ollama')

    store.providers.save(store.providerEditForm.provider(), '')

    expect(store.inputs.peek().providers).toEqual([{ name: 'Ollama', url: '' }])
  })

  it('when the navigator reaches completeSetup, setup starts and its tasks are listed', () => {
    const applicationData = mockApplicationData()
    const mkdir = spyOn(
      applicationData.filesystem,
      'mkdirWithParents',
    ).mockImplementation(() => new Promise<void>(() => {}))
    const store = new DataStore({ applicationData })

    store.navigator.goTo('completeSetup')

    expect(mkdir.mock.calls).toEqual([['.crow']])
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

  it('when the step moves, inputs report the new step', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })

    store.navigator.goTo('ignore')

    expect(store.inputs.peek().step).toBe('ignore')
  })

  it('when on the repo step, does not show the config', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })

    const showsConfig = store.showsConfig.peek()

    expect(showsConfig).toBe(false)
  })

  it('when past the repo step, shows the config', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })

    store.navigator.goTo('envFile')

    expect(store.showsConfig.peek()).toBe(true)
  })
})
