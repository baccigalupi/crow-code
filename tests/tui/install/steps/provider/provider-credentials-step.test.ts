import { describe, expect, it } from 'bun:test'
import { ProviderCredentialsStep } from '../../../../../src/tui/install/steps/provider/provider-credentials-step.ts'

describe('ProviderCredentialsStep', () => {
  it('when asked for its name, is providerCredentials', () => {
    const step = new ProviderCredentialsStep()

    const name = step.name

    expect(name).toBe('providerCredentials')
  })

  describe('when moving', () => {
    it('when finished, loops back to the name for the next provider', () => {
      const step = new ProviderCredentialsStep()

      const next = step.next

      expect(next).toBe('providerName')
    })

    it('when tabbed back, goes to the url', () => {
      const step = new ProviderCredentialsStep()

      const back = step.back

      expect(back).toBe('providerUrl')
    })

    it('when tabbed forward, has nowhere to go', () => {
      const step = new ProviderCredentialsStep()

      const forward = step.forward

      expect(forward).toBeUndefined()
    })
  })

  it('when typed, is masked', () => {
    const step = new ProviderCredentialsStep()

    const masked = step.masked

    expect(masked).toBe(true)
  })
})
