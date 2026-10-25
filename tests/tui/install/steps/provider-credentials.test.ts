import { describe, expect, it } from 'bun:test'
import { ProviderCredentialsStep } from '../../../../src/tui/install/steps/provider-credentials.ts'
import { buildInstallStore } from '../../../support/install-store.ts'

describe('ProviderCredentialsStep', () => {
  it('when asked for its state, returns the provider credentials input', () => {
    const installStore = buildInstallStore()
    installStore.step.value = 'providerCredentials'

    const step = new ProviderCredentialsStep(installStore)

    expect(step.name).toBe('providerCredentials')
    expect(step.nextStep).toBe('providerName')
    expect(step.state()).toBe(installStore.providerCredentials)
  })

  it('when cancelled, drops the typed credential and moves to confirm', () => {
    const installStore = buildInstallStore()
    installStore.providerName.value = { text: 'nous', cursor: 4 }
    installStore.providerUrl.value = { text: 'https://n', cursor: 9 }
    installStore.providerCredentials.value = { text: 'sk-1', cursor: 4 }
    installStore.step.value = 'providerCredentials'
    const step = new ProviderCredentialsStep(installStore)

    step.cancel()

    expect(installStore.step.peek()).toBe('confirm')
    expect(installStore.providerCredentials.peek()).toEqual({
      text: '',
      cursor: 0,
    })
    expect(installStore.envBuffer.peek()).toEqual({})
  })
})
