import { describe, expect, it } from 'bun:test'
import { Keypress } from '../../../../src/tui/keypress.ts'
import { IdleController } from '../../../../src/tui/install/complete-setup/idle-controller.ts'

describe('IdleController', () => {
  it('when any key arrives, returns its outcome', () => {
    const controller = new IdleController('exit')

    const outcome = controller.handle(new Keypress('x', {}))

    expect(outcome).toBe('exit')
  })

  it('when return arrives, returns stay for a stay controller', () => {
    const controller = new IdleController('stay')

    const outcome = controller.handle(new Keypress('', { return: true }))

    expect(outcome).toBe('stay')
  })
})
