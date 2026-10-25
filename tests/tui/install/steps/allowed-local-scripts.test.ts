import { describe, expect, it } from 'bun:test'
import { AllowedLocalScriptsStep } from '../../../../src/tui/install/steps/allowed-local-scripts.ts'
import { buildInstallStore } from '../../../support/install-store.ts'

describe('AllowedLocalScriptsStep', () => {
  it('when finished, moves on to the provider name', () => {
    const installStore = buildInstallStore()
    installStore.step.value = 'allowedLocalScripts'

    const step = new AllowedLocalScriptsStep(installStore)

    expect(step.nextStep).toBe('providerName')
  })
})
