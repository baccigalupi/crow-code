import { describe, expect, it } from 'bun:test'
import { ConfigJsonViewModel } from '../../../../../src/tui/install/app/config-preview/config-json-view-model.ts'
import { DataStore } from '../../../../../src/tui/install/data-store.ts'
import { mockApplicationData } from '../../../../support/mock-application-data.ts'

describe('ConfigJsonViewModel', () => {
  it('when asked for a string field, quotes its config value', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const viewModel = new ConfigJsonViewModel(store.inputs.peek(), {
      key: 'repo',
    })

    const field = viewModel.stringField('envFile')

    expect(field.quoted()).toBe('"~/.crow/.env"')
  })

  it('when the panel edits a field, highlights that field', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const viewModel = new ConfigJsonViewModel(store.inputs.peek(), {
      key: 'envFile',
    })

    const field = viewModel.stringField('envFile')

    expect(field.id()).toBe('config-highlight')
  })

  it('when asked for a list field, gives its permission entries', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const viewModel = new ConfigJsonViewModel(store.inputs.peek(), {
      key: 'repo',
    })

    const field = viewModel.listField('escalateWrite')

    expect(field.items()[0].quoted()).toBe('"./dev"')
    expect(field.comma()).toBe(',')
  })

  it('when asked for the last list field, ends it without a comma', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const viewModel = new ConfigJsonViewModel(store.inputs.peek(), {
      key: 'repo',
    })

    const field = viewModel.lastListField('allowedLocalScripts')

    expect(field.comma()).toBe('')
  })

  it('when providers are saved, gives one entry each, the last one last', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    store.providers.save({ name: 'nous', url: 'https://n' }, '')
    store.providers.save({ name: 'local', url: 'http://l' }, '')
    const viewModel = new ConfigJsonViewModel(store.inputs.peek(), {
      key: 'repo',
    })

    const providers = viewModel.providers()

    expect(providers).toHaveLength(2)
    expect(providers[0].comma()).toBe(',')
    expect(providers[1].comma()).toBe('')
  })

  it('when asked for its background, gives the config panel color', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const viewModel = new ConfigJsonViewModel(store.inputs.peek(), {
      key: 'repo',
    })

    const background = viewModel.background

    expect(background).toBe('#0a0f1e')
  })
})
