import { describe, expect, it } from 'bun:test'
import { ProviderUrlStep } from '../../../../src/tui/install/steps/provider-url.ts'
import { buildUserInputStore } from '../../../support/user-input-store.ts'

describe('ProviderUrlStep', () => {
  it('when asked for its state, returns the provider url input', () => {
    const userInputStore = buildUserInputStore()
    userInputStore.step.value = 'providerUrl'

    const step = new ProviderUrlStep(userInputStore)

    expect(step.name).toBe('providerUrl')
    expect(step.nextStep).toBe('providerCredentials')
    expect(step.state()).toBe(userInputStore.providerUrl)
  })

  it('when focused forward, moves to the credentials step', () => {
    const userInputStore = buildUserInputStore()
    userInputStore.step.value = 'providerUrl'

    new ProviderUrlStep(userInputStore).focus(1)

    expect(userInputStore.step.peek()).toBe('providerCredentials')
  })

  it('when cancelled, leaves the provider loop for confirm', () => {
    const userInputStore = buildUserInputStore()
    userInputStore.step.value = 'providerUrl'

    new ProviderUrlStep(userInputStore).cancel()

    expect(userInputStore.step.peek()).toBe('confirm')
  })
})
