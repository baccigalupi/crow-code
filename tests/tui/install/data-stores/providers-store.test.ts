import { describe, expect, it } from 'bun:test'
import { ProvidersStore } from '../../../../src/tui/install/data-stores/providers-store.ts'

describe('ProvidersStore', () => {
  describe('when committed', () => {
    it('buffers the credential under the upper snake api key var', () => {
      const providers = new ProvidersStore()
      providers.providerName.insert('Open Router')
      providers.providerUrl.insert('https://o')
      providers.providerCredentials.insert('sk-1')

      providers.commit()

      expect(providers.envBuffer.peek()).toEqual({
        OPEN_ROUTER_API_KEY: 'sk-1',
      })
    })

    it('keeps the provider name and url', () => {
      const providers = new ProvidersStore()
      providers.providerName.insert('Open Router')
      providers.providerUrl.insert('https://o')

      providers.commit()

      expect(providers.providers.peek()).toEqual([
        { name: 'Open Router', url: 'https://o' },
      ])
    })

    it('without a credential, buffers nothing', () => {
      const providers = new ProvidersStore()
      providers.providerName.insert('Ollama')

      providers.commit()

      expect(providers.envBuffer.peek()).toEqual({})
    })

    it('clears the draft', () => {
      const providers = new ProvidersStore()
      providers.providerName.insert('Open Router')

      providers.commit()

      expect(providers.providerName.text.peek()).toEqual({
        text: '',
        cursor: 0,
      })
    })
  })

  it('when cancelled, clears the draft', () => {
    const providers = new ProvidersStore()
    providers.providerUrl.insert('https://o')

    providers.cancel()

    expect(providers.providerUrl.text.peek()).toEqual({ text: '', cursor: 0 })
  })
})
