import { describe, expect, it } from 'bun:test'
import { Keypress } from '../../../../src/tui/keypress.ts'
import { ConfirmStore } from '../../../../src/tui/install/data-stores/confirm-store.ts'
import { ConfirmController } from '../../../../src/tui/install/confirm/controller.ts'

describe('ConfirmController', () => {
  describe('choosing', () => {
    it('when left, up, y or k arrive, chooses yes', () => {
      const confirmation = new ConfirmStore()
      const controller = new ConfirmController(confirmation)
      confirmation.choose(false)

      controller.handle(new Keypress('', { leftArrow: true }))
      const afterLeft = confirmation.confirmed.peek()
      confirmation.choose(false)
      controller.handle(new Keypress('', { upArrow: true }))
      const afterUp = confirmation.confirmed.peek()
      confirmation.choose(false)
      controller.handle(new Keypress('y', {}))
      const afterY = confirmation.confirmed.peek()
      confirmation.choose(false)
      const outcome = controller.handle(new Keypress('k', {}))

      expect(afterLeft).toBe(true)
      expect(afterUp).toBe(true)
      expect(afterY).toBe(true)
      expect(confirmation.confirmed.peek()).toBe(true)
      expect(outcome).toBe('stay')
    })

    it('when right, down, n or j arrive, chooses no', () => {
      const confirmation = new ConfirmStore()
      const controller = new ConfirmController(confirmation)

      controller.handle(new Keypress('', { rightArrow: true }))
      const afterRight = confirmation.confirmed.peek()
      confirmation.choose(true)
      controller.handle(new Keypress('', { downArrow: true }))
      const afterDown = confirmation.confirmed.peek()
      confirmation.choose(true)
      controller.handle(new Keypress('n', {}))
      const afterN = confirmation.confirmed.peek()
      confirmation.choose(true)
      const outcome = controller.handle(new Keypress('j', {}))

      expect(afterRight).toBe(false)
      expect(afterDown).toBe(false)
      expect(afterN).toBe(false)
      expect(confirmation.confirmed.peek()).toBe(false)
      expect(outcome).toBe('stay')
    })

    it('when another key arrives, keeps the answer and stays', () => {
      const confirmation = new ConfirmStore()
      const controller = new ConfirmController(confirmation)

      const outcome = controller.handle(new Keypress('x', {}))

      expect(outcome).toBe('stay')
      expect(confirmation.confirmed.peek()).toBe(true)
    })
  })

  describe('deciding', () => {
    it('when return arrives on yes, asks for next', () => {
      const controller = new ConfirmController(new ConfirmStore())

      const outcome = controller.handle(new Keypress('', { return: true }))

      expect(outcome).toBe('next')
    })

    it('when return arrives on no, exits', () => {
      const confirmation = new ConfirmStore()
      const controller = new ConfirmController(confirmation)
      confirmation.choose(false)

      const outcome = controller.handle(new Keypress('', { return: true }))

      expect(outcome).toBe('exit')
    })

    it('when escape arrives, stays and keeps the answer', () => {
      const confirmation = new ConfirmStore()
      const controller = new ConfirmController(confirmation)

      const flagged = controller.handle(new Keypress('', { escape: true }))
      const raw = controller.handle(new Keypress('\x1b', {}))

      expect(flagged).toBe('stay')
      expect(raw).toBe('stay')
      expect(confirmation.confirmed.peek()).toBe(true)
    })
  })
})
