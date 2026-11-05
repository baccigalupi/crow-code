import { describe, expect, it } from 'bun:test'
import { Steps } from '../../../../src/tui/install/steps/steps.ts'

describe('Steps', () => {
  it('when a step is found by name, is the step with that name', () => {
    const steps = new Steps()

    const step = steps.named('done')

    expect(step.name).toBe('done')
  })
})
