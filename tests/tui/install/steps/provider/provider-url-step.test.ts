import { describe, expect, it } from 'bun:test'
import { ProviderUrlStep } from '../../../../../src/tui/install/steps/provider/provider-url-step.ts'

describe('ProviderUrlStep', () => {
  it('when asked for its name, is providerUrl', () => {
    const step = new ProviderUrlStep()

    const name = step.name

    expect(name).toBe('providerUrl')
  })

  it('when finished, goes to the credentials', () => {
    const step = new ProviderUrlStep()

    const next = step.next

    expect(next).toBe('providerCredentials')
  })

  it('when tabbed back, goes to the name', () => {
    const step = new ProviderUrlStep()

    const back = step.back

    expect(back).toBe('providerName')
  })

  it('when tabbed forward, goes to the credentials', () => {
    const step = new ProviderUrlStep()

    const forward = step.forward

    expect(forward).toBe('providerCredentials')
  })
})
