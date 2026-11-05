import { describe, expect, it } from 'bun:test'
import { ProviderNameStep } from '../../../../src/tui/install/steps/provider/provider-name-step.ts'

describe('ProviderStep', () => {
  it('when not overridden, is typed in the clear', () => {
    const step = new ProviderNameStep()

    const masked = step.masked

    expect(masked).toBe(false)
  })
})
