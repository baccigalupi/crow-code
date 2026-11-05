import { describe, expect, it } from 'bun:test'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { ProviderCredentialsPanel } from '../../../../src/tui/install/provider/provider-credentials.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('ProviderCredentialsPanel', () => {
  it('when asked, names itself and loops back to the name field', () => {
    const panel = new ProviderCredentialsPanel()

    const { name } = panel

    expect(name).toBe('providerCredentials')
    expect(panel.next).toBe('providerName')
    expect(panel.cancel).toBe('confirm')
  })

  it('when asked for its field, is the credentials', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })

    const field = new ProviderCredentialsPanel().field(store)

    expect(field).toBe(store.providerEditForm.providerCredentials)
  })

  it('when asked where tab leads, goes back to the url and nowhere forward', () => {
    const panel = new ProviderCredentialsPanel()

    const { forward, back } = panel

    expect(back).toBe('providerUrl')
    expect(forward).toBeUndefined()
  })
})
