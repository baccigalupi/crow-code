import { describe, expect, it } from 'bun:test'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { ProviderUrlPanel } from '../../../../src/tui/install/provider/provider-url.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('ProviderUrlPanel', () => {
  it('when asked, names itself and its flow', () => {
    const panel = new ProviderUrlPanel()

    const { name } = panel

    expect(name).toBe('providerUrl')
    expect(panel.next).toBe('providerCredentials')
    expect(panel.cancel).toBe('confirm')
  })

  it('when asked for its field, is the provider url', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })

    const field = new ProviderUrlPanel().field(store)

    expect(field).toBe(store.providerEditForm.providerUrl)
  })

  it('when asked where tab leads, goes back to the name and forward to the credentials', () => {
    const panel = new ProviderUrlPanel()

    const { forward, back } = panel

    expect(back).toBe('providerName')
    expect(forward).toBe('providerCredentials')
  })
})
