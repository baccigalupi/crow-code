import { describe, expect, it } from 'bun:test'
import { ProviderNameStep } from '../../../../src/tui/install/steps/provider-name.ts'
import { buildUserInputStore } from '../../../support/user-input-store.ts'

describe('ProviderNameStep', () => {
  it('when asked for its state, returns the provider name input', () => {
    const userInputStore = buildUserInputStore()
    userInputStore.step.value = 'providerName'

    const step = new ProviderNameStep(userInputStore)

    expect(step.name).toBe('providerName')
    expect(step.nextStep).toBe('providerUrl')
    expect(step.state()).toBe(userInputStore.providerName)
  })
})
