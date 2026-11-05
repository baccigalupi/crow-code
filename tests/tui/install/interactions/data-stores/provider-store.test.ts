import { describe, expect, it } from 'bun:test'
import { ProviderStore } from '../../../../../src/tui/install/interactions/data-stores/provider-store.ts'

describe('ProviderStore', () => {
  it('when a provider is saved, lists it', () => {
    const store = new ProviderStore()

    store.save({ name: 'nous', url: 'https://n' }, '')

    expect(store.providers.peek()).toEqual([{ name: 'nous', url: 'https://n' }])
  })

  it('when saved with a credential, buffers it under the upper snake api key var', () => {
    const store = new ProviderStore()

    store.save({ name: ' Open Router! ', url: 'https://o' }, 'sk-1')

    expect(store.envBuffer.peek()).toEqual({ OPEN_ROUTER_API_KEY: 'sk-1' })
  })

  it('when saved without a credential, buffers nothing', () => {
    const store = new ProviderStore()

    store.save({ name: 'ollama', url: 'http://o' }, '')

    expect(store.envBuffer.peek()).toEqual({})
  })

  it('values lists the providers and the env buffer', () => {
    const store = new ProviderStore()
    store.save({ name: 'Open Router', url: 'https://o' }, 'sk-1')

    const values = store.values.peek()

    expect(values).toEqual({
      providers: [{ name: 'Open Router', url: 'https://o' }],
      envBuffer: { OPEN_ROUTER_API_KEY: 'sk-1' },
    })
  })
})
