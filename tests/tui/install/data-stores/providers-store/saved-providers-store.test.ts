import { describe, expect, it } from 'bun:test'
import { SavedProvidersStore } from '../../../../../src/tui/install/data-stores/providers-store/saved-providers-store.ts'

describe('SavedProvidersStore', () => {
  it('when a provider is saved, lists it', () => {
    const saved = new SavedProvidersStore()

    saved.save({ name: 'nous', url: 'https://n' }, '')

    expect(saved.providers.peek()).toEqual([{ name: 'nous', url: 'https://n' }])
  })

  it('when saved with a credential, buffers it under the upper snake api key var', () => {
    const saved = new SavedProvidersStore()

    saved.save({ name: ' Open Router! ', url: 'https://o' }, 'sk-1')

    expect(saved.envBuffer.peek()).toEqual({ OPEN_ROUTER_API_KEY: 'sk-1' })
  })

  it('when saved without a credential, buffers nothing', () => {
    const saved = new SavedProvidersStore()

    saved.save({ name: 'ollama', url: 'http://o' }, '')

    expect(saved.envBuffer.peek()).toEqual({})
  })
})
