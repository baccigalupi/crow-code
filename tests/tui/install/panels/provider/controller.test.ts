import { describe, expect, it } from 'bun:test'
import { Keypress } from '../../../../../src/tui/keypress.ts'
import { ProvidersStore } from '../../../../../src/tui/install/data-stores/providers-store.ts'
import { ProviderFormController } from '../../../../../src/tui/install/panels/provider/controller.ts'

describe('ProviderFormController', () => {
  it('when a character arrives, types into its own field only', () => {
    const providers = new ProvidersStore()
    const controller = new ProviderFormController({
      field: providers.providerUrl,
      providers,
      back: 'providerName',
      forward: 'providerCredentials',
    })

    const outcome = controller.handle(new Keypress('x', {}))

    expect(outcome).toBe('stay')
    expect(providers.providerUrl.text.peek()).toEqual({ text: 'x', cursor: 1 })
    expect(providers.providerName.text.peek()).toEqual({ text: '', cursor: 0 })
  })

  describe('tab', () => {
    it('when tab arrives, goes to the forward field', () => {
      const providers = new ProvidersStore()
      providers.providerUrl.insert('nous')
      const controller = new ProviderFormController({
        field: providers.providerUrl,
        providers,
        back: 'providerName',
        forward: 'providerCredentials',
      })

      const outcome = controller.handle(new Keypress('', { tab: true }))

      expect(outcome).toEqual({ goTo: 'providerCredentials' })
      expect(providers.providerUrl.text.peek()).toEqual({
        text: 'nous',
        cursor: 4,
      })
    })

    it('when shift tab arrives, goes to the back field', () => {
      const providers = new ProvidersStore()
      const controller = new ProviderFormController({
        field: providers.providerUrl,
        providers,
        back: 'providerName',
        forward: 'providerCredentials',
      })

      const outcome = controller.handle(
        new Keypress('', { tab: true, shift: true }),
      )

      expect(outcome).toEqual({ goTo: 'providerName' })
    })

    it('when tab arrives on the last field, stays', () => {
      const providers = new ProvidersStore()
      const controller = new ProviderFormController({
        field: providers.providerCredentials,
        providers,
        back: 'providerUrl',
      })

      const outcome = controller.handle(new Keypress('', { tab: true }))

      expect(outcome).toBe('stay')
    })

    it('when shift tab arrives on the first field, stays', () => {
      const providers = new ProvidersStore()
      const controller = new ProviderFormController({
        field: providers.providerName,
        providers,
        forward: 'providerUrl',
      })

      const outcome = controller.handle(
        new Keypress('', { tab: true, shift: true }),
      )

      expect(outcome).toBe('stay')
    })
  })

  describe('return', () => {
    it('when return arrives on the name, keeps the typed name', () => {
      const providers = new ProvidersStore()
      providers.providerName.insert('nous')
      const controller = new ProviderFormController({
        field: providers.providerName,
        providers,
        forward: 'providerUrl',
      })

      controller.handle(new Keypress('', { return: true }))

      expect(providers.providerName.text.peek().text).toBe('nous')
    })

    it('when return arrives before the last field, asks for next and saves nothing', () => {
      const providers = new ProvidersStore()
      const controller = new ProviderFormController({
        field: providers.providerName,
        providers,
        forward: 'providerUrl',
      })

      const outcome = controller.handle(new Keypress('', { return: true }))

      expect(outcome).toBe('next')
      expect(providers.providers.peek()).toEqual([])
    })

    it('when return arrives on the last field, saves the provider and clears the draft', () => {
      const providers = new ProvidersStore()
      providers.providerName.insert('nous')
      providers.providerUrl.insert('https://n')
      providers.providerCredentials.insert('sk-1')
      const controller = new ProviderFormController({
        field: providers.providerCredentials,
        providers,
        back: 'providerUrl',
      })

      const outcome = controller.handle(new Keypress('', { return: true }))

      expect(outcome).toBe('next')
      expect(providers.providers.peek()).toEqual([
        { name: 'nous', url: 'https://n' },
      ])
      expect(providers.envBuffer.peek()).toEqual({ NOUS_API_KEY: 'sk-1' })
      expect(providers.providerName.text.peek().text).toBe('')
      expect(providers.providerUrl.text.peek().text).toBe('')
      expect(providers.providerCredentials.text.peek().text).toBe('')
    })
  })

  describe('escape', () => {
    it('when escape arrives, does not type it', () => {
      const providers = new ProvidersStore()
      providers.providerName.insert('or')
      const controller = new ProviderFormController({
        field: providers.providerName,
        providers,
        forward: 'providerUrl',
      })

      controller.handle(new Keypress('\x1b', {}))

      expect(providers.providerName.text.peek().text).not.toContain('\x1b')
    })

    it('when escape arrives, cancels and clears the draft', () => {
      const providers = new ProvidersStore()
      providers.providerName.insert('or')
      const controller = new ProviderFormController({
        field: providers.providerName,
        providers,
        forward: 'providerUrl',
      })

      const outcome = controller.handle(new Keypress('\x1b', {}))

      expect(outcome).toBe('cancel')
      expect(providers.providerName.text.peek().text).toBe('')
    })

    it('when escape arrives after a saved provider, keeps the saved one', () => {
      const providers = new ProvidersStore()
      providers.providerName.insert('nous')
      providers.providerUrl.insert('https://n')
      providers.commit()
      providers.providerName.insert('or')
      const controller = new ProviderFormController({
        field: providers.providerName,
        providers,
        forward: 'providerUrl',
      })

      controller.handle(new Keypress('', { escape: true }))

      expect(providers.providers.peek()).toEqual([
        { name: 'nous', url: 'https://n' },
      ])
    })
  })
})
