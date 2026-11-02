import { describe, expect, it, mock } from 'bun:test'
import { createTestRenderer } from '@opentui/core/testing'
import { KeyboardListener } from '../../../../src/tui/install/interactions/keyboard-listener.ts'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('KeyboardListener', () => {
  it('when a char arrives, edits the active directory input', async () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    const { renderer, mockInput } = await createTestRenderer({
      width: 20,
      height: 3,
    })
    new KeyboardListener(renderer, model).listen()

    await mockInput.typeText('x')

    expect(model.directories.repoDirectory.text.peek().text).toBe('x')
    renderer.destroy()
  })

  it('when text is pasted, inserts it into the active field', async () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.navigator.goTo('providerCredentials')
    const { renderer, mockInput } = await createTestRenderer({
      width: 20,
      height: 3,
    })
    new KeyboardListener(renderer, model).listen()

    await mockInput.pasteBracketedText('sk-123')
    await renderer.idle()

    expect(model.providerEditForm.providerCredentials.text.peek().text).toBe(
      'sk-123',
    )
    renderer.destroy()
  })

  it('when pasted text has newlines, removes them without advancing', async () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.navigator.goTo('providerCredentials')
    const { renderer, mockInput } = await createTestRenderer({
      width: 20,
      height: 3,
    })
    new KeyboardListener(renderer, model).listen()

    await mockInput.pasteBracketedText('sk-123\r\n')
    await renderer.idle()

    expect(model.providerEditForm.providerCredentials.text.peek().text).toBe(
      'sk-123',
    )
    expect(model.navigator.current.peek()).toBe('providerCredentials')
    renderer.destroy()
  })

  it('when text is pasted on confirm, leaves the env file alone', async () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.navigator.goTo('confirm')
    const { renderer, mockInput } = await createTestRenderer({
      width: 20,
      height: 3,
    })
    new KeyboardListener(renderer, model).listen()

    await mockInput.pasteBracketedText('xyz')
    await renderer.idle()

    expect(model.directories.envFile.text.peek().text).toBe('')
    renderer.destroy()
  })

  it('when text is pasted on the done step, destroys the renderer', async () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.navigator.goTo('done')
    const onDestroy = mock(() => {})
    const { renderer, mockInput } = await createTestRenderer({
      width: 20,
      height: 3,
      onDestroy,
    })
    new KeyboardListener(renderer, model).listen()

    await mockInput.pasteBracketedText('x')
    await renderer.idle()

    expect(onDestroy).toHaveBeenCalledTimes(1)
  })

  it('when return arrives, advances the step', async () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    const { renderer, mockInput } = await createTestRenderer({
      width: 20,
      height: 3,
    })
    new KeyboardListener(renderer, model).listen()

    mockInput.pressEnter()
    await renderer.idle()

    expect(model.navigator.current.peek()).toBe('crowGlobalDirectory')
    renderer.destroy()
  })

  it('when ctrl-c arrives, destroys the renderer', async () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    const onDestroy = mock(() => {})
    const { renderer, mockInput } = await createTestRenderer({
      width: 20,
      height: 3,
      onDestroy,
    })
    new KeyboardListener(renderer, model).listen()

    mockInput.pressCtrlC()

    expect(onDestroy).toHaveBeenCalledTimes(1)
  })

  it('when escape arrives, keeps the renderer', async () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    const onDestroy = mock(() => {})
    const { renderer, mockInput } = await createTestRenderer({
      width: 20,
      height: 3,
      onDestroy,
      kittyKeyboard: true,
    })
    new KeyboardListener(renderer, model).listen()

    mockInput.pressEscape()

    expect(onDestroy).not.toHaveBeenCalled()
  })

  it('when n then return arrive on the confirm step, declines and exits without writing', async () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    model.navigator.goTo('confirm')
    const onDestroy = mock(() => {})
    const { renderer, mockInput } = await createTestRenderer({
      width: 20,
      height: 3,
      onDestroy,
    })
    new KeyboardListener(renderer, model).listen()

    await mockInput.typeText('n')
    mockInput.pressEnter()

    expect(model.confirm.confirmed.peek()).toBe(false)
    expect(model.navigator.current.peek()).toBe('confirm')
    expect(onDestroy).toHaveBeenCalledTimes(1)
  })

  it('when disposed, typing leaves the field empty', async () => {
    const model = new DataStore({ applicationData: mockApplicationData() })
    const { renderer, mockInput } = await createTestRenderer({
      width: 20,
      height: 3,
    })
    const listener = new KeyboardListener(renderer, model)
    listener.listen()

    listener.dispose()
    await mockInput.typeText('x')

    expect(model.directories.repoDirectory.text.peek().text).toBe('')
    renderer.destroy()
  })
})
