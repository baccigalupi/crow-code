import { describe, expect, it, mock } from 'bun:test'
import { Keypress } from '../../../../src/tui/install/interactions/keypress.ts'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('keypress', () => {
  it('when escape arrives on a step without cancel, stays put', () => {
    const exit = mock(() => {})
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.step.goTo('ignore')

    new Keypress({ model, exit, input: '', key: { escape: true } }).handle()

    expect(exit).not.toHaveBeenCalled()
    expect(model.step.current.peek()).toBe('ignore')
  })

  it('when a raw escape character arrives, stays put without editing', () => {
    const exit = mock(() => {})
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.step.goTo('ignore')

    new Keypress({ model, exit, input: '\x1b', key: {} }).handle()

    expect(exit).not.toHaveBeenCalled()
    expect(model.permissions.ignore.text.peek()).toEqual({
      text: '',
      cursor: 0,
    })
  })

  it('when escape arrives on a provider step, drops the draft and moves to confirm', () => {
    const exit = mock(() => {})
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.providers.providerName.insert('nous')
    model.providers.providerUrl.insert('https://n')
    model.providers.commit()
    model.providers.providerName.insert('or')
    model.step.goTo('providerUrl')

    new Keypress({ model, exit, input: '', key: { escape: true } }).handle()

    expect(model.step.current.peek()).toBe('confirm')
    expect(model.providers.providerName.text.peek()).toEqual({
      text: '',
      cursor: 0,
    })
    expect(model.providers.providers.peek()).toEqual([
      { name: 'nous', url: 'https://n' },
    ])
  })

  it('when tab arrives on a provider step, moves to the next field', () => {
    const exit = mock(() => {})
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.providers.providerName.insert('nous')
    model.step.goTo('providerName')

    new Keypress({ model, exit, input: '', key: { tab: true } }).handle()

    expect(model.step.current.peek()).toBe('providerUrl')
    expect(model.providers.providerName.text.peek()).toEqual({
      text: 'nous',
      cursor: 4,
    })
  })

  it('when shift+tab arrives on the first provider field, stays put', () => {
    const exit = mock(() => {})
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.step.goTo('providerName')

    new Keypress({
      model,
      exit,
      input: '',
      key: { tab: true, shift: true },
    }).handle()

    expect(model.step.current.peek()).toBe('providerName')
  })

  it('when tab arrives on the last provider field, stays put', () => {
    const exit = mock(() => {})
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.step.goTo('providerCredentials')

    new Keypress({ model, exit, input: '', key: { tab: true } }).handle()

    expect(model.step.current.peek()).toBe('providerCredentials')
  })

  it('when tab arrives on a step without fields, stays put', () => {
    const exit = mock(() => {})
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.step.goTo('ignore')

    new Keypress({ model, exit, input: '', key: { tab: true } }).handle()

    expect(model.step.current.peek()).toBe('ignore')
  })

  it('when return arrives on the credentials step, commits the provider and starts another', () => {
    const exit = mock(() => {})
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.providers.providerName.insert('nous')
    model.providers.providerUrl.insert('https://n')
    model.providers.providerCredentials.insert('sk-1')
    model.step.goTo('providerCredentials')

    new Keypress({ model, exit, input: '', key: { return: true } }).handle()

    expect(model.providers.providers.peek()).toEqual([
      { name: 'nous', url: 'https://n' },
    ])
    expect(model.providers.envBuffer.peek()).toEqual({ NOUS_API_KEY: 'sk-1' })
    expect(model.providers.providerName.text.peek()).toEqual({
      text: '',
      cursor: 0,
    })
    expect(model.providers.providerUrl.text.peek()).toEqual({
      text: '',
      cursor: 0,
    })
    expect(model.providers.providerCredentials.text.peek()).toEqual({
      text: '',
      cursor: 0,
    })
    expect(model.step.current.peek()).toBe('providerName')
  })

  it('when return arrives on the credentials step with no credential, buffers nothing', () => {
    const exit = mock(() => {})
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.providers.providerName.insert('ollama')
    model.providers.providerUrl.insert('http://o')
    model.step.goTo('providerCredentials')

    new Keypress({ model, exit, input: '', key: { return: true } }).handle()

    expect(model.providers.providers.peek()).toEqual([
      { name: 'ollama', url: 'http://o' },
    ])
    expect(model.providers.envBuffer.peek()).toEqual({})
  })

  it('when ctrl-c arrives, exits', () => {
    const exit = mock(() => {})
    const model = new DataStore({ applicationData: mockApplicationData() })

    new Keypress({ model, exit, input: 'c', key: { ctrl: true } }).handle()

    expect(exit).toHaveBeenCalledTimes(1)
  })

  it('when any key arrives on the done step, exits', () => {
    const exit = mock(() => {})
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.step.goTo('done')

    new Keypress({ model, exit, input: 'x', key: {} }).handle()

    expect(exit).toHaveBeenCalledTimes(1)
  })

  it('when return arrives on the repo step, advances to the global directory step', () => {
    const exit = mock(() => {})
    const model = new DataStore({ applicationData: mockApplicationData() })

    new Keypress({ model, exit, input: '', key: { return: true } }).handle()

    expect(model.step.current.peek()).toBe('crowGlobalDirectory')
  })

  it('when a letter arrives on the env file step, edits the env file text', () => {
    const exit = mock(() => {})
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.step.goTo('envFile')

    new Keypress({ model, exit, input: 'x', key: {} }).handle()

    expect(model.directories.envFile.text.peek()).toEqual({
      text: 'x',
      cursor: 1,
    })
  })

  describe('on the confirm step', () => {
    it('when left arrives, confirmation becomes true', () => {
      const exit = mock(() => {})
      const model = new DataStore({ applicationData: mockApplicationData() })
      model.step.goTo('confirm')
      model.confirm.choose(false)

      new Keypress({
        model,
        exit,
        input: '',
        key: { leftArrow: true },
      }).handle()

      expect(model.confirm.confirmed.peek()).toBe(true)
    })

    it('when n arrives, confirmation becomes false', () => {
      const exit = mock(() => {})
      const model = new DataStore({ applicationData: mockApplicationData() })
      model.step.goTo('confirm')

      new Keypress({ model, exit, input: 'n', key: {} }).handle()

      expect(model.confirm.confirmed.peek()).toBe(false)
    })

    it('when down arrives, confirmation becomes false', () => {
      const exit = mock(() => {})
      const model = new DataStore({ applicationData: mockApplicationData() })
      model.step.goTo('confirm')

      new Keypress({
        model,
        exit,
        input: '',
        key: { downArrow: true },
      }).handle()

      expect(model.confirm.confirmed.peek()).toBe(false)
    })

    it('when j arrives, confirmation becomes false', () => {
      const exit = mock(() => {})
      const model = new DataStore({ applicationData: mockApplicationData() })
      model.step.goTo('confirm')

      new Keypress({ model, exit, input: 'j', key: {} }).handle()

      expect(model.confirm.confirmed.peek()).toBe(false)
    })

    it('when up arrives, confirmation becomes true', () => {
      const exit = mock(() => {})
      const model = new DataStore({ applicationData: mockApplicationData() })
      model.step.goTo('confirm')
      model.confirm.choose(false)

      new Keypress({ model, exit, input: '', key: { upArrow: true } }).handle()

      expect(model.confirm.confirmed.peek()).toBe(true)
    })

    it('when k arrives, confirmation becomes true', () => {
      const exit = mock(() => {})
      const model = new DataStore({ applicationData: mockApplicationData() })
      model.step.goTo('confirm')
      model.confirm.choose(false)

      new Keypress({ model, exit, input: 'k', key: {} }).handle()

      expect(model.confirm.confirmed.peek()).toBe(true)
    })

    it('when return arrives while confirmed, moves to the completeSetup step', () => {
      const exit = mock(() => {})
      const model = new DataStore({ applicationData: mockApplicationData() })
      model.step.goTo('confirm')

      new Keypress({ model, exit, input: '', key: { return: true } }).handle()

      expect(model.step.current.peek()).toBe('completeSetup')
    })

    it('when return arrives while declined, exits and stays on confirm', () => {
      const exit = mock(() => {})
      const model = new DataStore({ applicationData: mockApplicationData() })
      model.step.goTo('confirm')
      model.confirm.choose(false)

      new Keypress({ model, exit, input: '', key: { return: true } }).handle()

      expect(exit).toHaveBeenCalledTimes(1)
      expect(model.step.current.peek()).toBe('confirm')
    })
  })
})
