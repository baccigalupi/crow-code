import { describe, expect, it } from 'bun:test'
import { ConfigJsonViewModel } from '../../../../../src/tui/install/app/config-preview/config-json-view-model.ts'
import { DataStore } from '../../../../../src/tui/install/data-store.ts'
import { mockApplicationData } from '../../../../support/mock-application-data.ts'

describe('ConfigJsonViewModel', () => {
  it('when asked for a value, gives it from the config', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const viewModel = new ConfigJsonViewModel(store.inputs.peek())

    const value = viewModel.value('envFile')

    expect(value).toBe('~/.crow/.env')
  })

  it('when asked for a permission, gives its list from the config', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const viewModel = new ConfigJsonViewModel(store.inputs.peek())

    const list = viewModel.permission('escalateWrite')

    expect(list).toEqual(['./dev', './agent'])
  })

  it('when providers are saved, gives one row each, the last one last', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    store.providers.save({ name: 'nous', url: 'https://n' }, '')
    store.providers.save({ name: 'local', url: 'http://l' }, '')
    const viewModel = new ConfigJsonViewModel(store.inputs.peek())

    const providers = viewModel.providers()

    expect(providers).toEqual([
      { index: 0, name: 'nous', baseUrl: 'https://n', last: false },
      { index: 1, name: 'local', baseUrl: 'http://l', last: true },
    ])
  })

  it('when asked for the json, gives the whole config as json', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    store.directories.globalDirectory.insert('/g')
    const viewModel = new ConfigJsonViewModel(store.inputs.peek())

    const json = viewModel.json()

    expect(json).toContain('"crowGlobalDirectory": "/g"')
  })

  it('when asked for its background, gives the config panel color', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const viewModel = new ConfigJsonViewModel(store.inputs.peek())

    const background = viewModel.background

    expect(background).toBe('#0a0f1e')
  })
})
