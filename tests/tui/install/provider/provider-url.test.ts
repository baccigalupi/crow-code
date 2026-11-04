import { describe, expect, it } from 'bun:test'
import { Keypress } from '../../../../src/tui/keypress.ts'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { ProviderUrlPanel } from '../../../../src/tui/install/provider/provider-url.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('ProviderUrlPanel', () => {
  it('when asked, names itself, its flow and the config line it edits', () => {
    const panel = new ProviderUrlPanel()

    const { name } = panel

    expect(name).toBe('providerUrl')
    expect(panel.next).toBe('providerCredentials')
    expect(panel.cancel).toBe('confirm')
    expect(panel.highlights).toEqual({ key: 'baseUrl', occurrence: 'last' })
  })

  it('when a key is typed, its controller edits the provider url', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const controller = new ProviderUrlPanel().controller(store)

    controller.handle(new Keypress('x', {}))

    expect(store.providerEditForm.providerUrl.text.peek().text).toBe('x')
  })

  it('when shift-tab is pressed, its controller goes back to the name field', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const controller = new ProviderUrlPanel().controller(store)

    const outcome = controller.handle(
      new Keypress('', { tab: true, shift: true }),
    )

    expect(outcome).toEqual({ goTo: 'providerName' })
  })

  it('when tab is pressed, its controller goes on to the credentials field', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const controller = new ProviderUrlPanel().controller(store)

    const outcome = controller.handle(new Keypress('', { tab: true }))

    expect(outcome).toEqual({ goTo: 'providerCredentials' })
  })
})
