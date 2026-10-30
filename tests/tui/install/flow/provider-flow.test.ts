import { describe, expect, it } from 'bun:test'
import { Keypress } from '../../../../src/tui/keypress.ts'
import { ProvidersStore } from '../../../../src/tui/install/data-stores/providers-store.ts'
import { ProviderFlow } from '../../../../src/tui/install/flow/provider-flow.ts'

describe('ProviderFlow', () => {
  it('when asked, return walks name, url, credentials and loops', () => {
    const flow = new ProviderFlow(new ProvidersStore())

    const panels = flow.panels()

    expect(panels.providerName.next).toBe('providerUrl')
    expect(panels.providerUrl.next).toBe('providerCredentials')
    expect(panels.providerCredentials.next).toBe('providerName')
  })

  it('when asked, escape from every field goes to confirm', () => {
    const flow = new ProviderFlow(new ProvidersStore())

    const panels = flow.panels()

    expect(panels.providerName.cancel).toBe('confirm')
    expect(panels.providerUrl.cancel).toBe('confirm')
    expect(panels.providerCredentials.cancel).toBe('confirm')
  })

  it('when tab arrives on the url, goes to the credentials', () => {
    const panels = new ProviderFlow(new ProvidersStore()).panels()

    const outcome = panels.providerUrl.controller.handle(
      new Keypress('', { tab: true }),
    )

    expect(outcome).toEqual({ goTo: 'providerCredentials' })
  })

  it('when shift tab arrives on the url, goes to the name', () => {
    const panels = new ProviderFlow(new ProvidersStore()).panels()

    const outcome = panels.providerUrl.controller.handle(
      new Keypress('', { tab: true, shift: true }),
    )

    expect(outcome).toEqual({ goTo: 'providerName' })
  })

  it('when a key arrives on a field, types into that field', () => {
    const providers = new ProvidersStore()
    const panels = new ProviderFlow(providers).panels()

    panels.providerCredentials.controller.handle(new Keypress('x', {}))

    expect(providers.providerCredentials.text.peek().text).toBe('x')
  })
})
