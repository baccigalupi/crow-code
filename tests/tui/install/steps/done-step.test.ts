import { describe, expect, it } from 'bun:test'
import { DoneStep } from '../../../../src/tui/install/steps/done-step.ts'

describe('DoneStep', () => {
  it('when asked for its name, is done', () => {
    const step = new DoneStep()

    const name = step.name

    expect(name).toBe('done')
  })
})
