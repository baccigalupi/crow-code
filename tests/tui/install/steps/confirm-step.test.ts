import { describe, expect, it } from 'bun:test'
import { ConfirmStep } from '../../../../src/tui/install/steps/confirm-step.ts'

describe('ConfirmStep', () => {
  it('when asked for its name, is confirm', () => {
    const step = new ConfirmStep()

    const name = step.name

    expect(name).toBe('confirm')
  })
})
