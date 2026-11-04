import { describe, expect, it } from 'bun:test'
import { Keypress } from '../../../../src/tui/keypress.ts'
import { TextFieldStore } from '../../../../src/tui/install/data-stores/text-field-store.ts'
import { TextPromptController } from '../../../../src/tui/install/text-prompt/controller.ts'

describe('TextPromptController', () => {
  it('when return arrives, asks for next and leaves the text', () => {
    const field = new TextFieldStore()
    const controller = new TextPromptController(field)

    const outcome = controller.handle(new Keypress('', { return: true }))

    expect(outcome).toBe('next')
    expect(field.text.peek()).toEqual({ text: '', cursor: 0 })
  })

  it('when a raw escape arrives, stays and does not type it', () => {
    const field = new TextFieldStore()
    const controller = new TextPromptController(field)

    const outcome = controller.handle(new Keypress('\x1b', {}))

    expect(outcome).toBe('stay')
    expect(field.text.peek().text).toBe('')
  })

  it('when the escape flag arrives, stays', () => {
    const controller = new TextPromptController(new TextFieldStore())

    const outcome = controller.handle(new Keypress('', { escape: true }))

    expect(outcome).toBe('stay')
  })

  it('when a character arrives, types it and stays', () => {
    const field = new TextFieldStore()
    const controller = new TextPromptController(field)

    const outcome = controller.handle(new Keypress('x', {}))

    expect(outcome).toBe('stay')
    expect(field.text.peek()).toEqual({ text: 'x', cursor: 1 })
  })

  it('when backspace arrives, removes the typed character', () => {
    const field = new TextFieldStore()
    const controller = new TextPromptController(field)
    controller.handle(new Keypress('x', {}))

    controller.handle(new Keypress('', { backspace: true }))

    expect(field.text.peek()).toEqual({ text: '', cursor: 0 })
  })
})
