import { describe, expect, it } from 'bun:test'
import { TextSteps } from '../../../../src/tui/install/steps/text-steps.ts'

describe('TextSteps', () => {
  it('when a step is found by name, is the step with that name', () => {
    const steps = new TextSteps()

    const step = steps.named('envFile')

    expect(step.name).toBe('envFile')
  })

  it('when asked for all, lists every question', () => {
    const steps = new TextSteps()

    const all = steps.all()

    expect(all).toHaveLength(9)
  })
})
