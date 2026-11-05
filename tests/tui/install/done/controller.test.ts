import { describe, expect, it } from 'bun:test'
import { Keypress } from '../../../../src/tui/keypress.ts'
import { DoneController } from '../../../../src/tui/install/done/controller.ts'

describe('DoneController', () => {
  it('when any key is pressed, exits', () => {
    const controller = new DoneController()

    const outcome = controller.handle(new Keypress('x', {}))

    expect(outcome).toBe('exit')
  })
})
