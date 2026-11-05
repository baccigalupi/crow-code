import { describe, expect, it } from 'bun:test'
import { ProviderSteps } from '../../../../src/tui/install/steps/provider-steps.ts'

describe('ProviderSteps', () => {
  it('when a step is found by name, is the step with that name', () => {
    const steps = new ProviderSteps()

    const step = steps.named('providerUrl')

    expect(step.name).toBe('providerUrl')
  })

  it('when asked for all, lists every field', () => {
    const steps = new ProviderSteps()

    const all = steps.all()

    expect(all).toHaveLength(3)
  })
})
