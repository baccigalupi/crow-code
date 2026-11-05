import { describe, expect, it, mock } from 'bun:test'
import { Keypress } from '../../../../src/tui/keypress.ts'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { ProviderActions } from '../../../../src/tui/install/provider/actions.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('ProviderActions', () => {
  describe('input', () => {
    it('when the input changes, the panel field holds the new text', () => {
      const store = new DataStore({ applicationData: mockApplicationData() })
      const navigation = { goTo: mock(), exit: mock() }
      const actions = new ProviderActions({
        step: 'providerUrl',
        store,
        navigation,
      })

      actions.input()('https://n')

      expect(store.providerEditForm.providerUrl.text.peek().text).toBe(
        'https://n',
      )
      expect(store.providerEditForm.providerName.text.peek().text).toBe('')
    })

    it('when the input is submitted, goes to the next panel and saves nothing', () => {
      const store = new DataStore({ applicationData: mockApplicationData() })
      const navigation = { goTo: mock(), exit: mock() }
      const actions = new ProviderActions({
        step: 'providerName',
        store,
        navigation,
      })

      actions.submit()()

      expect(navigation.goTo.mock.calls).toEqual([['providerUrl']])
      expect(store.providers.providers.peek()).toEqual([])
    })

    it('when a character arrives on an input field, leaves it to the input', () => {
      const store = new DataStore({ applicationData: mockApplicationData() })
      const navigation = { goTo: mock(), exit: mock() }
      const actions = new ProviderActions({
        step: 'providerName',
        store,
        navigation,
      })

      const used = actions.press(new Keypress('x', {}))

      expect(used).toBe(false)
      expect(store.providerEditForm.providerName.text.peek().text).toBe('')
    })
  })

  describe('tab', () => {
    it('when tab arrives, goes to the forward field', () => {
      const store = new DataStore({ applicationData: mockApplicationData() })
      const navigation = { goTo: mock(), exit: mock() }
      const actions = new ProviderActions({
        step: 'providerUrl',
        store,
        navigation,
      })

      const used = actions.press(new Keypress('', { tab: true }))

      expect(used).toBe(true)
      expect(navigation.goTo.mock.calls).toEqual([['providerCredentials']])
    })

    it('when shift tab arrives, goes to the back field', () => {
      const store = new DataStore({ applicationData: mockApplicationData() })
      const navigation = { goTo: mock(), exit: mock() }
      const actions = new ProviderActions({
        step: 'providerUrl',
        store,
        navigation,
      })

      actions.press(new Keypress('', { tab: true, shift: true }))

      expect(navigation.goTo.mock.calls).toEqual([['providerName']])
    })

    it('when tab arrives on the last field, does not move', () => {
      const store = new DataStore({ applicationData: mockApplicationData() })
      const navigation = { goTo: mock(), exit: mock() }
      const actions = new ProviderActions({
        step: 'providerCredentials',
        store,
        navigation,
      })

      actions.press(new Keypress('', { tab: true }))

      expect(navigation.goTo).toHaveBeenCalledTimes(0)
    })
  })

  describe('escape', () => {
    it('when escape arrives, clears the form and goes to the cancel panel', () => {
      const store = new DataStore({ applicationData: mockApplicationData() })
      store.providerEditForm.providerName.insert('or')
      const navigation = { goTo: mock(), exit: mock() }
      const actions = new ProviderActions({
        step: 'providerName',
        store,
        navigation,
      })

      const used = actions.press(new Keypress('\x1b', {}))

      expect(used).toBe(true)
      expect(navigation.goTo.mock.calls).toEqual([['confirm']])
      expect(store.providerEditForm.providerName.text.peek().text).toBe('')
    })

    it('when escape arrives after a finished provider, keeps the finished one', () => {
      const store = new DataStore({ applicationData: mockApplicationData() })
      store.providers.save({ name: 'nous', url: 'https://n' }, '')
      const navigation = { goTo: mock(), exit: mock() }
      const actions = new ProviderActions({
        step: 'providerName',
        store,
        navigation,
      })

      actions.press(new Keypress('', { escape: true }))

      expect(store.providers.providers.peek()).toEqual([
        { name: 'nous', url: 'https://n' },
      ])
    })

    it('when shift tab arrives on the first field, does not move', () => {
      const store = new DataStore({ applicationData: mockApplicationData() })
      const navigation = { goTo: mock(), exit: mock() }
      const actions = new ProviderActions({
        step: 'providerName',
        store,
        navigation,
      })

      actions.press(new Keypress('', { tab: true, shift: true }))

      expect(navigation.goTo).toHaveBeenCalledTimes(0)
    })
  })

  describe('masked key', () => {
    it('when a character arrives, types it into the key', () => {
      const store = new DataStore({ applicationData: mockApplicationData() })
      const navigation = { goTo: mock(), exit: mock() }
      const actions = new ProviderActions({
        step: 'providerCredentials',
        store,
        navigation,
      })

      const used = actions.press(new Keypress('x', {}))

      expect(used).toBe(true)
      expect(store.providerEditForm.providerCredentials.text.peek()).toEqual({
        text: 'x',
        cursor: 1,
      })
    })

    it('when return arrives, saves the provider, clears the form and goes next', () => {
      const store = new DataStore({ applicationData: mockApplicationData() })
      store.providerEditForm.providerName.insert('nous')
      store.providerEditForm.providerUrl.insert('https://n')
      store.providerEditForm.providerCredentials.insert('sk-1')
      const navigation = { goTo: mock(), exit: mock() }
      const actions = new ProviderActions({
        step: 'providerCredentials',
        store,
        navigation,
      })

      actions.press(new Keypress('', { return: true }))

      expect(navigation.goTo.mock.calls).toEqual([['providerName']])
      expect(store.providers.providers.peek()).toEqual([
        { name: 'nous', url: 'https://n' },
      ])
      expect(store.providers.envBuffer.peek()).toEqual({ NOUS_API_KEY: 'sk-1' })
      expect(store.providerEditForm.providerName.text.peek().text).toBe('')
      expect(store.providerEditForm.providerCredentials.text.peek().text).toBe(
        '',
      )
    })

    it('when backspace arrives, removes the typed character', () => {
      const store = new DataStore({ applicationData: mockApplicationData() })
      store.providerEditForm.providerCredentials.insert('x')
      const navigation = { goTo: mock(), exit: mock() }
      const actions = new ProviderActions({
        step: 'providerCredentials',
        store,
        navigation,
      })

      actions.press(new Keypress('', { backspace: true }))

      expect(store.providerEditForm.providerCredentials.text.peek().text).toBe(
        '',
      )
    })
  })
})
