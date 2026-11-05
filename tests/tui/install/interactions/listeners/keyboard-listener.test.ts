import { describe, expect, it, mock } from 'bun:test'
import { createTestRenderer } from '@opentui/core/testing'
import { KeyboardListener } from '../../../../../src/tui/install/interactions/listeners/keyboard-listener.ts'
import { DataStore } from '../../../../../src/tui/install/data-store.ts'
import { mockApplicationData } from '../../../../support/mock-application-data.ts'

describe('KeyboardListener', () => {
  it('when a char arrives, edits the active directory input', async () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const { renderer, mockInput } = await createTestRenderer({
      width: 20,
      height: 3,
    })
    new KeyboardListener(renderer, store).listen()

    await mockInput.typeText('x')

    expect(store.directories.repoDirectory.text.peek().text).toBe('x')
    renderer.destroy()
  })

  it('when pasted text has newlines, inserts it without them and without advancing', async () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    store.navigator.goTo('providerCredentials')
    const { renderer, mockInput } = await createTestRenderer({
      width: 20,
      height: 3,
    })
    new KeyboardListener(renderer, store).listen()

    await mockInput.pasteBracketedText('sk-123\r\n')
    await renderer.idle()

    expect(store.providerEditForm.providerCredentials.text.peek().text).toBe(
      'sk-123',
    )
    expect(store.navigator.current.peek()).toBe('providerCredentials')
    renderer.destroy()
  })

  it('when text is pasted on confirm, leaves the env file alone', async () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    store.navigator.goTo('confirm')
    const { renderer, mockInput } = await createTestRenderer({
      width: 20,
      height: 3,
    })
    new KeyboardListener(renderer, store).listen()

    await mockInput.pasteBracketedText('xyz')
    await renderer.idle()

    expect(store.directories.envFile.text.peek().text).toBe('')
    renderer.destroy()
  })

  it('when text is pasted on the done step, destroys the renderer', async () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    store.navigator.goTo('done')
    const onDestroy = mock(() => {})
    const { renderer, mockInput } = await createTestRenderer({
      width: 20,
      height: 3,
      onDestroy,
    })
    new KeyboardListener(renderer, store).listen()

    await mockInput.pasteBracketedText('x')
    await renderer.idle()

    expect(onDestroy).toHaveBeenCalledTimes(1)
  })

  it('when return arrives, advances the step', async () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const { renderer, mockInput } = await createTestRenderer({
      width: 20,
      height: 3,
    })
    new KeyboardListener(renderer, store).listen()

    mockInput.pressEnter()
    await renderer.idle()

    expect(store.navigator.current.peek()).toBe('crowGlobalDirectory')
    renderer.destroy()
  })

  it('when ctrl-c arrives, destroys the renderer', async () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const onDestroy = mock(() => {})
    const { renderer, mockInput } = await createTestRenderer({
      width: 20,
      height: 3,
      onDestroy,
    })
    new KeyboardListener(renderer, store).listen()

    mockInput.pressCtrlC()

    expect(onDestroy).toHaveBeenCalledTimes(1)
  })

  it('when escape arrives, keeps the renderer', async () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const onDestroy = mock(() => {})
    const { renderer, mockInput } = await createTestRenderer({
      width: 20,
      height: 3,
      onDestroy,
      kittyKeyboard: true,
    })
    new KeyboardListener(renderer, store).listen()

    mockInput.pressEscape()

    expect(onDestroy).not.toHaveBeenCalled()
    renderer.destroy()
  })

  it('when n then return arrive on the confirm step, declines and exits', async () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    store.navigator.goTo('confirm')
    const onDestroy = mock(() => {})
    const { renderer, mockInput } = await createTestRenderer({
      width: 20,
      height: 3,
      onDestroy,
    })
    new KeyboardListener(renderer, store).listen()

    await mockInput.typeText('n')
    mockInput.pressEnter()

    expect(store.confirm.confirmed.peek()).toBe(false)
    expect(store.navigator.current.peek()).toBe('confirm')
    expect(onDestroy).toHaveBeenCalledTimes(1)
  })
})
