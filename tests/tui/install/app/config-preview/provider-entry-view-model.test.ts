import { describe, expect, it } from 'bun:test'
import { ProviderEntryViewModel } from '../../../../../src/tui/install/app/config-preview/provider-entry-view-model.ts'

describe('ProviderEntryViewModel', () => {
  it('when asked for its values, gives the name and base url', () => {
    const entry = new ProviderEntryViewModel({
      index: 0,
      name: 'nous',
      baseUrl: 'https://n',
      last: true,
    })

    const values = [entry.name(), entry.baseUrl()]

    expect(values).toEqual(['nous', 'https://n'])
  })

  it('when the last provider, is editable and ends without a comma', () => {
    const entry = new ProviderEntryViewModel({
      index: 1,
      name: 'nous',
      baseUrl: 'https://n',
      last: true,
    })

    const editable = entry.editable()

    expect(editable).toBe(true)
    expect(entry.comma()).toBe('')
  })

  it('when followed by another provider, is not editable and ends with a comma', () => {
    const entry = new ProviderEntryViewModel({
      index: 0,
      name: 'nous',
      baseUrl: 'https://n',
      last: false,
    })

    const editable = entry.editable()

    expect(editable).toBe(false)
    expect(entry.comma()).toBe(',')
  })
})
