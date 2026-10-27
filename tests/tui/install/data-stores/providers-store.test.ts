import { describe, expect, it } from 'bun:test'
import { ProvidersStore } from '../../../../src/tui/install/data-stores/providers-store.ts'
import { StepStore } from '../../../../src/tui/install/data-stores/step-store.ts'

describe('ProvidersStore', () => {
  describe('when committed', () => {
    it('buffers the credential under the upper snake api key var', () => {
      const step = new StepStore()
      const providers = new ProvidersStore(step)
      providers.providerName.insert('Open Router')
      providers.providerUrl.insert('https://o')
      providers.providerCredentials.insert('sk-1')

      providers.commit()

      expect(providers.envBuffer.peek()).toEqual({
        OPEN_ROUTER_API_KEY: 'sk-1',
      })
    })

    it('keeps the provider name and url', () => {
      const step = new StepStore()
      const providers = new ProvidersStore(step)
      providers.providerName.insert('Open Router')
      providers.providerUrl.insert('https://o')

      providers.commit()

      expect(providers.providers.peek()).toEqual([
        { name: 'Open Router', url: 'https://o' },
      ])
    })

    it('without a credential, buffers nothing', () => {
      const step = new StepStore()
      const providers = new ProvidersStore(step)
      providers.providerName.insert('Ollama')

      providers.commit()

      expect(providers.envBuffer.peek()).toEqual({})
    })

    it('clears the draft and starts another provider', () => {
      const step = new StepStore()
      step.goTo('providerCredentials')
      const providers = new ProvidersStore(step)
      providers.providerName.insert('Open Router')

      providers.commit()

      expect(providers.providerName.text.peek()).toEqual({
        text: '',
        cursor: 0,
      })
      expect(step.current.peek()).toBe('providerName')
    })
  })

  it('when cancelled, clears the draft and goes to confirm', () => {
    const step = new StepStore()
    step.goTo('providerUrl')
    const providers = new ProvidersStore(step)
    providers.providerUrl.insert('https://o')

    providers.cancel()

    expect(providers.providerUrl.text.peek()).toEqual({ text: '', cursor: 0 })
    expect(step.current.peek()).toBe('confirm')
  })

  describe('when focus moves', () => {
    it('forward from the name, shows the url', () => {
      const step = new StepStore()
      step.goTo('providerName')
      const providers = new ProvidersStore(step)

      providers.focus(1)

      expect(step.current.peek()).toBe('providerUrl')
    })

    it('past the last field, stays on the credentials', () => {
      const step = new StepStore()
      step.goTo('providerName')
      const providers = new ProvidersStore(step)

      providers.focus(5)

      expect(step.current.peek()).toBe('providerCredentials')
    })

    it('before the first field, stays on the name', () => {
      const step = new StepStore()
      step.goTo('providerUrl')
      const providers = new ProvidersStore(step)

      providers.focus(-3)

      expect(step.current.peek()).toBe('providerName')
    })
  })
})
