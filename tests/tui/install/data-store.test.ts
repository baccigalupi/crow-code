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
    model.providers.providerName.insert('Ollama')

    model.providers.commit()

    expect(model.inputs.peek().providers).toEqual([{ name: 'Ollama', url: '' }])
  })

  it('when return commits a provider, the step values change once', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.providers.providerName.insert('nous')
    model.navigator.goTo('providerCredentials')
    const watcher = mock()
    effect(() => watcher(model.stepValues.value.step))

    model.navigator.press(new Keypress('', { return: true }), mock())

    expect(watcher.mock.calls).toEqual([
      ['providerCredentials'],
      ['providerName'],
    ])
  })

  it('when listening, reaching completeSetup starts setup', () => {
    const applicationData = mockApplicationData()
    const mkdir = spyOn(
      applicationData.filesystem,
      'mkdirWithParents',
    ).mockImplementation(() => new Promise<void>(() => {}))
    const model = new DataStore({ applicationData })
    model.listen()

    model.navigator.goTo('completeSetup')

    expect(mkdir.mock.calls).toEqual([['.crow']])
  })

  it('when disposed, reaching completeSetup starts no setup', () => {
    const applicationData = mockApplicationData()
    const mkdir = spyOn(applicationData.filesystem, 'mkdirWithParents')
    const model = new DataStore({ applicationData })
    model.listen()
    model.dispose()

    model.navigator.goTo('completeSetup')

    expect(mkdir).not.toHaveBeenCalled()
  })

  it('when the step moves, inputs report the new step', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })

    model.navigator.goTo('ignore')

    expect(model.inputs.peek().step).toBe('ignore')
  })

  it('when no repo directory is typed, the config path is in the default directory', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })

    const { crowConfigPath } = model.stepValues.peek()

    expect(crowConfigPath).toBe('.crow/config.json')
  })

  it('when a repo directory is typed, the config path is inside it', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.directories.repoDirectory.insert('./lib')

    const { crowConfigPath } = model.stepValues.peek()

    expect(crowConfigPath).toBe('./lib/config.json')
  })
})
