import { describe, expect, it } from 'bun:test'
import { Keypress } from '../../../../src/tui/keypress.ts'
import { ProviderEditFormStore } from '../../../../src/tui/install/data-stores/provider-edit-form-store.ts'
import { ProviderStore } from '../../../../src/tui/install/data-stores/provider-store.ts'
import { ProviderFormController } from '../../../../src/tui/install/provider/controller.ts'

describe('ProviderFormController', () => {
  it('when a character arrives, types into its own field only', () => {
    const form = new ProviderEditFormStore()
    const providers = new ProviderStore()
    const controller = new ProviderFormController({
      field: form.providerUrl,
      form,
      providers,
      back: 'providerName',
      forward: 'providerCredentials',
    })

    const outcome = controller.handle(new Keypress('x', {}))

    expect(outcome).toBe('stay')
    expect(form.providerUrl.text.peek()).toEqual({ text: 'x', cursor: 1 })
    expect(form.providerName.text.peek()).toEqual({ text: '', cursor: 0 })
  })

  describe('tab', () => {
    it('when tab arrives, goes to the forward field', () => {
      const form = new ProviderEditFormStore()
      const providers = new ProviderStore()
      form.providerUrl.insert('nous')
      const controller = new ProviderFormController({
        field: form.providerUrl,
        form,
        providers,
        back: 'providerName',
        forward: 'providerCredentials',
      })

      const outcome = controller.handle(new Keypress('', { tab: true }))

      expect(outcome).toEqual({ goTo: 'providerCredentials' })
      expect(form.providerUrl.text.peek()).toEqual({
        text: 'nous',
        cursor: 4,
      })
    })

    it('when shift tab arrives, goes to the back field', () => {
      const form = new ProviderEditFormStore()
      const providers = new ProviderStore()
      const controller = new ProviderFormController({
        field: form.providerUrl,
        form,
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
      const form = new ProviderEditFormStore()
      const providers = new ProviderStore()
      const controller = new ProviderFormController({
        field: form.providerCredentials,
        form,
        providers,
        back: 'providerUrl',
      })

      const outcome = controller.handle(new Keypress('', { tab: true }))

      expect(outcome).toBe('stay')
    })

    it('when shift tab arrives on the first field, stays', () => {
      const form = new ProviderEditFormStore()
      const providers = new ProviderStore()
      const controller = new ProviderFormController({
        field: form.providerName,
        form,
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
      const form = new ProviderEditFormStore()
      const providers = new ProviderStore()
      form.providerName.insert('nous')
      const controller = new ProviderFormController({
        field: form.providerName,
        form,
        providers,
        forward: 'providerUrl',
      })

      controller.handle(new Keypress('', { return: true }))

      expect(form.providerName.text.peek().text).toBe('nous')
    })

    it('when return arrives before the last field, asks for next and saves nothing', () => {
      const form = new ProviderEditFormStore()
      const providers = new ProviderStore()
      const controller = new ProviderFormController({
        field: form.providerName,
        form,
        providers,
        forward: 'providerUrl',
      })

      const outcome = controller.handle(new Keypress('', { return: true }))

      expect(outcome).toBe('next')
      expect(providers.providers.peek()).toEqual([])
    })

    it('when return arrives on the last field, saves the provider and clears the form', () => {
      const form = new ProviderEditFormStore()
      const providers = new ProviderStore()
      form.providerName.insert('nous')
      form.providerUrl.insert('https://n')
      form.providerCredentials.insert('sk-1')
      const controller = new ProviderFormController({
        field: form.providerCredentials,
        form,
        providers,
        back: 'providerUrl',
      })

      const outcome = controller.handle(new Keypress('', { return: true }))

      expect(outcome).toBe('next')
      expect(providers.providers.peek()).toEqual([
        { name: 'nous', url: 'https://n' },
      ])
      expect(providers.envBuffer.peek()).toEqual({ NOUS_API_KEY: 'sk-1' })
      expect(form.providerName.text.peek().text).toBe('')
      expect(form.providerUrl.text.peek().text).toBe('')
      expect(form.providerCredentials.text.peek().text).toBe('')
    })
  })

  describe('escape', () => {
    it('when escape arrives, does not type it', () => {
      const form = new ProviderEditFormStore()
      const providers = new ProviderStore()
      form.providerName.insert('or')
      const controller = new ProviderFormController({
        field: form.providerName,
        form,
        providers,
        forward: 'providerUrl',
      })

      controller.handle(new Keypress('\x1b', {}))

      expect(form.providerName.text.peek().text).not.toContain('\x1b')
    })

    it('when escape arrives, cancels and clears the form', () => {
      const form = new ProviderEditFormStore()
      const providers = new ProviderStore()
      form.providerName.insert('or')
      const controller = new ProviderFormController({
        field: form.providerName,
        form,
        providers,
        forward: 'providerUrl',
      })

      const outcome = controller.handle(new Keypress('\x1b', {}))

      expect(outcome).toBe('cancel')
      expect(form.providerName.text.peek().text).toBe('')
    })

    it('when escape arrives after a finished provider, keeps the finished one', () => {
      const form = new ProviderEditFormStore()
      const providers = new ProviderStore()
      providers.save({ name: 'nous', url: 'https://n' }, '')
      form.providerName.insert('or')
      const controller = new ProviderFormController({
        field: form.providerName,
        form,
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
