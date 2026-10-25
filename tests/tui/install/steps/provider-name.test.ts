import { describe, expect, it } from 'bun:test'
import { ProviderNameStep } from '../../../../src/tui/install/steps/provider-name.ts'
import { buildInstallStore } from '../../../support/install-store.ts'

describe('ProviderNameStep', () => {
  it('when asked for its state, returns the provider name input', () => {
    const installStore = buildInstallStore()
    installStore.step.value = 'providerName'

    const step = new ProviderNameStep(installStore)

    expect(step.name).toBe('providerName')
    expect(step.nextStep).toBe('providerUrl')
    expect(step.state()).toBe(installStore.providerName)
  })
})
