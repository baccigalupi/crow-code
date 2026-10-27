import { describe, expect, it, mock, spyOn } from 'bun:test'
import { effect } from '@preact/signals-core'
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

  it('when a letter is pressed on the repo step, types it into the repo directory', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })

    model.press('x', {}, mock())

    expect(model.directories.repoDirectory.text.peek()).toEqual({
      text: 'x',
      cursor: 1,
    })
  })

  it('when return is pressed on the repo step, moves to the global directory', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })

    model.press('', { return: true }, mock())

    expect(model.step.current.peek()).toBe('crowGlobalDirectory')
  })

  it('when a credential is pasted, types it without its newlines and keeps the step', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.step.goTo('providerCredentials')

    model.paste('sk-123\r\n', mock())

    expect(model.providers.providerCredentials.text.peek()).toEqual({
      text: 'sk-123',
      cursor: 6,
    })
    expect(model.step.current.peek()).toBe('providerCredentials')
  })

  it('when pasting on the confirm step, types nothing', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.step.goTo('confirm')

    model.paste('/x', mock())

    expect(model.directories.envFile.text.peek()).toEqual({
      text: '',
      cursor: 0,
    })
  })

  it('when return commits a provider, the step values change once', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.providers.providerName.insert('nous')
    model.step.goTo('providerCredentials')
    const watcher = mock()
    effect(() => watcher(model.stepValues.value.step))

    model.press('', { return: true }, mock())

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

    model.step.goTo('completeSetup')

    expect(mkdir.mock.calls).toEqual([['.crow']])
  })

  it('when disposed, reaching completeSetup starts no setup', () => {
    const applicationData = mockApplicationData()
    const mkdir = spyOn(applicationData.filesystem, 'mkdirWithParents')
    const model = new DataStore({ applicationData })
    model.listen()
    model.dispose()

    model.step.goTo('completeSetup')

    expect(mkdir).not.toHaveBeenCalled()
  })

  it('when the step moves, inputs report the new step', () => {
    const model = new DataStore({ applicationData: mockApplicationData() })

    model.step.goTo('ignore')

    expect(model.inputs.peek().step).toBe('ignore')
  })
})
