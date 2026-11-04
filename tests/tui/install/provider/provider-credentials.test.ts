import { describe, expect, it } from 'bun:test'
import { Keypress } from '../../../../src/tui/keypress.ts'
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
    expect(panel.highlights).toEqual({ key: 'providerCredentials' })
  })

  it('when a key is typed, its controller edits the credentials', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const controller = new ProviderCredentialsPanel().controller(store)

    controller.handle(new Keypress('x', {}))

    expect(store.providerEditForm.providerCredentials.text.peek().text).toBe(
      'x',
    )
  })

  it('when return is pressed, its controller saves the provider and moves on', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    store.providerEditForm.providerName.insert('nous')
    const controller = new ProviderCredentialsPanel().controller(store)

    const outcome = controller.handle(new Keypress('', { return: true }))

    expect(outcome).toBe('next')
    expect(store.providers.providers.peek()).toHaveLength(1)
  })

  it('when shift-tab is pressed, its controller goes back to the url field', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const controller = new ProviderCredentialsPanel().controller(store)

    const outcome = controller.handle(
      new Keypress('', { tab: true, shift: true }),
    )

    expect(outcome).toEqual({ goTo: 'providerUrl' })
  })
})
