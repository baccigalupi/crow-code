import { describe, expect, it } from 'bun:test'
import { ProviderEntryViewModel } from '../../../../../src/tui/install/app/config-preview/provider-entry-view-model.ts'

describe('ProviderEntryViewModel', () => {
  it('when asked for its fields, quotes the name and base url', () => {
    const entry = new ProviderEntryViewModel({
      provider: { name: 'nous', baseUrl: 'https://n' },
      index: 0,
      last: true,
      highlightKey: 'repo',
      json: '{}',
    })

    const fields = [entry.name(), entry.baseUrl()]

    expect(fields[0].quoted()).toBe('"nous"')
    expect(fields[1].quoted()).toBe('"https://n"')
  })

  it('when asked for its fields, ends the base url without a comma', () => {
    const entry = new ProviderEntryViewModel({
      provider: { name: 'nous', baseUrl: 'https://n' },
      index: 0,
      last: true,
      highlightKey: 'repo',
      json: '{}',
    })

    const fields = [entry.name(), entry.baseUrl()]

    expect(fields[0].comma()).toBe(',')
    expect(fields[1].comma()).toBe('')
  })

  it('when last and its key is highlighted, highlights that field', () => {
    const entry = new ProviderEntryViewModel({
      provider: { name: 'nous', baseUrl: 'https://n' },
      index: 1,
      last: true,
      highlightKey: 'baseUrl',
      json: '{}',
    })

    const id = entry.baseUrl().id()

    expect(id).toBe('config-highlight')
  })

  it('when not last, highlights nothing even for its key', () => {
    const entry = new ProviderEntryViewModel({
      provider: { name: 'nous', baseUrl: 'https://n' },
      index: 0,
      last: false,
      highlightKey: 'baseUrl',
      json: '{}',
    })

    const id = entry.baseUrl().id()

    expect(id).toBe('config-baseUrl')
  })

  it('when followed by another provider, ends with a comma', () => {
    const entry = new ProviderEntryViewModel({
      provider: { name: 'nous', baseUrl: 'https://n' },
      index: 0,
      last: false,
      highlightKey: 'repo',
      json: '{}',
    })

    const comma = entry.comma()

    expect(comma).toBe(',')
  })

  it('when the last provider, ends without a comma', () => {
    const entry = new ProviderEntryViewModel({
      provider: { name: 'nous', baseUrl: 'https://n' },
      index: 0,
      last: true,
      highlightKey: 'repo',
      json: '{}',
    })

    const comma = entry.comma()

    expect(comma).toBe('')
  })
})
