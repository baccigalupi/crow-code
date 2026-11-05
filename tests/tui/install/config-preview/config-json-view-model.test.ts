import { describe, expect, it } from 'bun:test'
import { ConfigJsonViewModel } from '../../../../src/tui/install/config-preview/config-json-view-model.ts'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('ConfigJsonViewModel', () => {
  it('when asked for the directories, gives them from the config', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const viewModel = new ConfigJsonViewModel(
      store.inputs.peek(),
      'repoDirectory',
    )

    const directories = [viewModel.crowGlobalDirectory(), viewModel.envFile()]

    expect(directories).toEqual(['~/.crow', '~/.crow/.env'])
  })

  it('when asked for the permissions, writes each array as json', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    store.permissions.ignore.replace('a')
    store.permissions.additionalRead.replace('b')
    store.permissions.additionalWrite.replace('c')
    store.permissions.escalateRead.replace('d')
    const viewModel = new ConfigJsonViewModel(
      store.inputs.peek(),
      'repoDirectory',
    )

    const arrays = [
      viewModel.ignore(),
      viewModel.additionalRead(),
      viewModel.additionalWrite(),
      viewModel.escalateRead(),
      viewModel.escalateWrite(),
      viewModel.allowedLocalScripts(),
    ]

    expect(arrays).toEqual([
      '[\n  "a"\n]',
      '[\n  "b"\n]',
      '[\n  "c"\n]',
      '[\n  "d"\n]',
      '[\n  "./dev",\n  "./agent"\n]',
      '[\n  "./dev/*",\n  "./agent/*"\n]',
    ])
  })

  it('when a permission array is empty, writes empty brackets', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const viewModel = new ConfigJsonViewModel(
      store.inputs.peek(),
      'repoDirectory',
    )

    const json = viewModel.ignore()

    expect(json).toBe('[]')
  })

  it('when providers are saved, gives one row each, the last one last', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    store.providers.save({ name: 'nous', url: 'https://n' }, '')
    store.providers.save({ name: 'local', url: 'http://l' }, '')
    const viewModel = new ConfigJsonViewModel(
      store.inputs.peek(),
      'repoDirectory',
    )

    const providers = viewModel.providers()

    expect(providers).toEqual([
      { index: 0, name: 'nous', baseUrl: 'https://n', last: false },
      { index: 1, name: 'local', baseUrl: 'http://l', last: true },
    ])
  })

  it('when asked for its key, joins the selected step and the json', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    store.directories.globalDirectory.replace('/g')
    const viewModel = new ConfigJsonViewModel(store.inputs.peek(), 'envFile')

    const key = viewModel.key()

    expect(key).toStartWith('envFile\n{')
    expect(key).toContain('"crowGlobalDirectory": "/g"')
  })

  it('when asked for its background, gives the config panel color', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const viewModel = new ConfigJsonViewModel(
      store.inputs.peek(),
      'repoDirectory',
    )

    const background = viewModel.background

    expect(background).toBe('#0a0f1e')
  })
})
