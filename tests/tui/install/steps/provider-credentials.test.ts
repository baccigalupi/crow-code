import { describe, expect, it } from 'bun:test'
import { ProviderCredentialsStep } from '../../../../src/tui/install/steps/provider-credentials.ts'
import { buildUserInputStore } from '../../../support/user-input-store.ts'

describe('ProviderCredentialsStep', () => {
  it('when asked for its state, returns the provider credentials input', () => {
    const userInputStore = buildUserInputStore()
    userInputStore.step.value = 'providerCredentials'

    const step = new ProviderCredentialsStep(userInputStore)

    expect(step.name).toBe('providerCredentials')
    expect(step.nextStep).toBe('providerName')
    expect(step.state()).toBe(userInputStore.providerCredentials)
  })

  it('when cancelled, drops the typed credential and moves to confirm', () => {
    const userInputStore = buildUserInputStore()
    userInputStore.providerName.value = { text: 'nous', cursor: 4 }
    userInputStore.providerUrl.value = { text: 'https://n', cursor: 9 }
    userInputStore.providerCredentials.value = { text: 'sk-1', cursor: 4 }
    userInputStore.step.value = 'providerCredentials'
    const step = new ProviderCredentialsStep(userInputStore)

    step.cancel()

    expect(userInputStore.step.peek()).toBe('confirm')
    expect(userInputStore.providerCredentials.peek()).toEqual({
      text: '',
      cursor: 0,
    })
    expect(userInputStore.envBuffer.peek()).toEqual({})
  })
})
