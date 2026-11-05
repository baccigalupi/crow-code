import { describe, expect, it } from 'bun:test'
import { ProviderNameStep } from '../../../../../src/tui/install/steps/provider/provider-name-step.ts'

describe('ProviderNameStep', () => {
  it('when asked for its name, is providerName', () => {
    const step = new ProviderNameStep()

    const name = step.name

    expect(name).toBe('providerName')
  })

  it('when finished, goes to the url', () => {
    const step = new ProviderNameStep()

    const next = step.next

    expect(next).toBe('providerUrl')
  })

  it('when tabbed back, has nowhere to go', () => {
    const step = new ProviderNameStep()

    const back = step.back

    expect(back).toBeUndefined()
  })

  it('when tabbed forward, goes to the url', () => {
    const step = new ProviderNameStep()

    const forward = step.forward

    expect(forward).toBe('providerUrl')
  })
})
