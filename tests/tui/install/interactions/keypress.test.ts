import { describe, expect, it, mock } from 'bun:test'
import { keypress } from '../../../../src/tui/install/interactions/keypress.ts'
import { buildUserInputStore } from '../../../support/user-input-store.ts'

describe('keypress', () => {
  it('when escape arrives on a step without cancel, stays put', () => {
    const exit = mock(() => {})
    const userInputStore = buildUserInputStore()
    userInputStore.step.value = 'ignore'

    keypress({
      userInputStore,
      exit,
      input: '',
      key: { escape: true },
    }).handle()

    expect(exit).not.toHaveBeenCalled()
    expect(userInputStore.step.peek()).toBe('ignore')
  })

  it('when a raw escape character arrives, stays put without editing', () => {
    const exit = mock(() => {})
    const userInputStore = buildUserInputStore()
    userInputStore.step.value = 'ignore'

    keypress({ userInputStore, exit, input: '\x1b', key: {} }).handle()

    expect(exit).not.toHaveBeenCalled()
    expect(userInputStore.ignore.peek()).toEqual({ text: '', cursor: 0 })
  })

  it('when escape arrives on a provider step, drops the draft and moves to confirm', () => {
    const exit = mock(() => {})
    const userInputStore = buildUserInputStore()
    userInputStore.providerName.value = { text: 'or', cursor: 2 }
    userInputStore.providers.value = [{ name: 'nous', url: 'https://n' }]
    userInputStore.step.value = 'providerUrl'

    keypress({
      userInputStore,
      exit,
      input: '',
      key: { escape: true },
    }).handle()

    expect(userInputStore.step.peek()).toBe('confirm')
    expect(userInputStore.providerName.peek()).toEqual({ text: '', cursor: 0 })
    expect(userInputStore.providers.peek()).toEqual([
      { name: 'nous', url: 'https://n' },
    ])
  })

  it('when tab arrives on a provider step, moves to the next field', () => {
    const exit = mock(() => {})
    const userInputStore = buildUserInputStore()
    userInputStore.providerName.value = { text: 'nous', cursor: 4 }
    userInputStore.step.value = 'providerName'

    keypress({ userInputStore, exit, input: '', key: { tab: true } }).handle()

    expect(userInputStore.step.peek()).toBe('providerUrl')
    expect(userInputStore.providerName.peek()).toEqual({
      text: 'nous',
      cursor: 4,
    })
  })

  it('when shift+tab arrives on the first provider field, stays put', () => {
    const exit = mock(() => {})
    const userInputStore = buildUserInputStore()
    userInputStore.step.value = 'providerName'

    keypress({
      userInputStore,
      exit,
      input: '',
      key: { tab: true, shift: true },
    }).handle()

    expect(userInputStore.step.peek()).toBe('providerName')
  })

  it('when tab arrives on the last provider field, stays put', () => {
    const exit = mock(() => {})
    const userInputStore = buildUserInputStore()
    userInputStore.step.value = 'providerCredentials'

    keypress({ userInputStore, exit, input: '', key: { tab: true } }).handle()

    expect(userInputStore.step.peek()).toBe('providerCredentials')
  })

  it('when tab arrives on a step without fields, stays put', () => {
    const exit = mock(() => {})
    const userInputStore = buildUserInputStore()
    userInputStore.step.value = 'ignore'

    keypress({ userInputStore, exit, input: '', key: { tab: true } }).handle()

    expect(userInputStore.step.peek()).toBe('ignore')
  })

  it('when return arrives on the credentials step, commits the provider and starts another', () => {
    const exit = mock(() => {})
    const userInputStore = buildUserInputStore()
    userInputStore.providerName.value = { text: 'nous', cursor: 4 }
    userInputStore.providerUrl.value = { text: 'https://n', cursor: 9 }
    userInputStore.providerCredentials.value = { text: 'sk-1', cursor: 4 }
    userInputStore.step.value = 'providerCredentials'

    keypress({
      userInputStore,
      exit,
      input: '',
      key: { return: true },
    }).handle()

    expect(userInputStore.providers.peek()).toEqual([
      { name: 'nous', url: 'https://n' },
    ])
    expect(userInputStore.envBuffer.peek()).toEqual({ NOUS_API_KEY: 'sk-1' })
    expect(userInputStore.providerName.peek()).toEqual({ text: '', cursor: 0 })
    expect(userInputStore.providerUrl.peek()).toEqual({ text: '', cursor: 0 })
    expect(userInputStore.providerCredentials.peek()).toEqual({
      text: '',
      cursor: 0,
    })
    expect(userInputStore.step.peek()).toBe('providerName')
  })

  it('when return arrives on the credentials step with no credential, buffers nothing', () => {
    const exit = mock(() => {})
    const userInputStore = buildUserInputStore()
    userInputStore.providerName.value = { text: 'ollama', cursor: 6 }
    userInputStore.providerUrl.value = { text: 'http://o', cursor: 8 }
    userInputStore.step.value = 'providerCredentials'

    keypress({
      userInputStore,
      exit,
      input: '',
      key: { return: true },
    }).handle()

    expect(userInputStore.providers.peek()).toEqual([
      { name: 'ollama', url: 'http://o' },
    ])
    expect(userInputStore.envBuffer.peek()).toEqual({})
  })

  it('when ctrl-c arrives, exits', () => {
    const exit = mock(() => {})
    const userInputStore = buildUserInputStore()

    keypress({ userInputStore, exit, input: 'c', key: { ctrl: true } }).handle()

    expect(exit).toHaveBeenCalledTimes(1)
  })

  it('when any key arrives on the done step, exits', () => {
    const exit = mock(() => {})
    const userInputStore = buildUserInputStore()
    userInputStore.step.value = 'done'

    keypress({ userInputStore, exit, input: 'x', key: {} }).handle()

    expect(exit).toHaveBeenCalledTimes(1)
  })

  it('when return arrives on the repo step, advances to the global directory step', () => {
    const exit = mock(() => {})
    const userInputStore = buildUserInputStore()

    keypress({
      userInputStore,
      exit,
      input: '',
      key: { return: true },
    }).handle()

    expect(userInputStore.step.peek()).toBe('crowGlobalDirectory')
  })

  it('when a letter arrives on the env file step, edits the env file text', () => {
    const exit = mock(() => {})
    const userInputStore = buildUserInputStore()
    userInputStore.step.value = 'envFile'

    keypress({ userInputStore, exit, input: 'x', key: {} }).handle()

    expect(userInputStore.envFile.peek()).toEqual({ text: 'x', cursor: 1 })
  })

  describe('on the confirm step', () => {
    it('when left arrives, confirmation becomes true', () => {
      const exit = mock(() => {})
      const userInputStore = buildUserInputStore()
      userInputStore.step.value = 'confirm'
      userInputStore.confirmation.value = false

      keypress({
        userInputStore,
        exit,
        input: '',
        key: { leftArrow: true },
      }).handle()

      expect(userInputStore.confirmation.peek()).toBe(true)
    })

    it('when n arrives, confirmation becomes false', () => {
      const exit = mock(() => {})
      const userInputStore = buildUserInputStore()
      userInputStore.step.value = 'confirm'

      keypress({ userInputStore, exit, input: 'n', key: {} }).handle()

      expect(userInputStore.confirmation.peek()).toBe(false)
    })

    it('when down arrives, confirmation becomes false', () => {
      const exit = mock(() => {})
      const userInputStore = buildUserInputStore()
      userInputStore.step.value = 'confirm'

      keypress({
        userInputStore,
        exit,
        input: '',
        key: { downArrow: true },
      }).handle()

      expect(userInputStore.confirmation.peek()).toBe(false)
    })

    it('when j arrives, confirmation becomes false', () => {
      const exit = mock(() => {})
      const userInputStore = buildUserInputStore()
      userInputStore.step.value = 'confirm'

      keypress({ userInputStore, exit, input: 'j', key: {} }).handle()

      expect(userInputStore.confirmation.peek()).toBe(false)
    })

    it('when up arrives, confirmation becomes true', () => {
      const exit = mock(() => {})
      const userInputStore = buildUserInputStore()
      userInputStore.step.value = 'confirm'
      userInputStore.confirmation.value = false

      keypress({
        userInputStore,
        exit,
        input: '',
        key: { upArrow: true },
      }).handle()

      expect(userInputStore.confirmation.peek()).toBe(true)
    })

    it('when k arrives, confirmation becomes true', () => {
      const exit = mock(() => {})
      const userInputStore = buildUserInputStore()
      userInputStore.step.value = 'confirm'
      userInputStore.confirmation.value = false

      keypress({ userInputStore, exit, input: 'k', key: {} }).handle()

      expect(userInputStore.confirmation.peek()).toBe(true)
    })

    it('when return arrives while confirmed, moves to the completeSetup step', () => {
      const exit = mock(() => {})
      const userInputStore = buildUserInputStore()
      userInputStore.step.value = 'confirm'

      keypress({
        userInputStore,
        exit,
        input: '',
        key: { return: true },
      }).handle()

      expect(userInputStore.step.peek()).toBe('completeSetup')
    })

    it('when return arrives while declined, exits and stays on confirm', () => {
      const exit = mock(() => {})
      const userInputStore = buildUserInputStore()
      userInputStore.step.value = 'confirm'
      userInputStore.confirmation.value = false

      keypress({
        userInputStore,
        exit,
        input: '',
        key: { return: true },
      }).handle()

      expect(exit).toHaveBeenCalledTimes(1)
      expect(userInputStore.step.peek()).toBe('confirm')
    })
  })
})
