import { describe, expect, it } from 'bun:test'
import { ProviderUrlStep } from '../../../../src/tui/install/steps/provider-url.ts'
import { buildInstallStore } from '../../../support/install-store.ts'

describe('ProviderUrlStep', () => {
  it('when asked for its state, returns the provider url input', () => {
    const installStore = buildInstallStore()
    installStore.step.value = 'providerUrl'

    const step = new ProviderUrlStep(installStore)

    expect(step.name).toBe('providerUrl')
    expect(step.nextStep).toBe('providerCredentials')
    expect(step.state()).toBe(installStore.providerUrl)
  })

  it('when focused forward, moves to the credentials step', () => {
    const installStore = buildInstallStore()
    installStore.step.value = 'providerUrl'

    new ProviderUrlStep(installStore).focus(1)

    expect(installStore.step.peek()).toBe('providerCredentials')
  })

  it('when cancelled, leaves the provider loop for confirm', () => {
    const installStore = buildInstallStore()
    installStore.step.value = 'providerUrl'

    new ProviderUrlStep(installStore).cancel()

    expect(installStore.step.peek()).toBe('confirm')
  })
})
