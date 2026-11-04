import { describe, expect, it, mock, spyOn } from 'bun:test'
import { effect } from '@preact/signals-core'
import { Keypress } from '../../../src/tui/keypress.ts'
import { DataStore } from '../../../src/tui/install/data-store.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'

describe('DataStore', () => {
  it('when a directory is typed, inputs include the typed directory', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })

    model.directories.repoDirectory.insert('/r')

    expect(model.inputs.peek().repoDirectory).toEqual({ text: '/r', cursor: 2 })
  })

  it('when a provider is committed, inputs list the provider', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.providerEditForm.providerName.insert('Ollama')

    model.providers.save(model.providerEditForm.provider(), '')

    expect(model.inputs.peek().providers).toEqual([{ name: 'Ollama', url: '' }])
  })

  it('when return commits a provider, the step changes once', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.providerEditForm.providerName.insert('nous')
    model.navigator.goTo('providerCredentials')
    const watcher = mock()
    effect(() => watcher(model.navigator.current.value))

    model.navigator.press(new Keypress('', { return: true }), mock())

    expect(watcher.mock.calls).toEqual([
      ['providerCredentials'],
      ['providerName'],
    ])
  })

  it('when the navigator reaches completeSetup, setup starts and its tasks are listed', () => {
    const applicationData = mockApplicationData()
    const mkdir = spyOn(
      applicationData.filesystem,
      'mkdirWithParents',
    ).mockImplementation(() => new Promise<void>(() => {}))
    const model = new DataStore({ applicationData })

    model.navigator.goTo('completeSetup')

    expect(mkdir.mock.calls).toEqual([['.crow']])
    expect(model.progress.tasks.peek()).toEqual([
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
    const model = new DataStore({ applicationData: mockApplicationData() })

    model.navigator.goTo('ignore')

    expect(model.inputs.peek().step).toBe('ignore')
  })

  it('when on the repo step, does not show the config', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })

    const showsConfig = model.showsConfig.peek()

    expect(showsConfig).toBe(false)
  })

  it('when past the repo step, shows the config', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })

    model.navigator.goTo('envFile')

    expect(model.showsConfig.peek()).toBe(true)
  })
})
