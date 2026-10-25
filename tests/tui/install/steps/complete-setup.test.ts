import { describe, expect, it } from 'bun:test'
import { CompleteSetupStep } from '../../../../src/tui/install/steps/complete-setup.ts'
import { SetupProgress } from '../../../../src/tui/install/views/steps/setup-progress.tsx'
import { buildInstallStore } from '../../../support/install-store.ts'

describe('CompleteSetupStep', () => {
  it('when asked for its name, returns completeSetup', () => {
    const installStore = buildInstallStore()

    const step = new CompleteSetupStep(installStore)

    expect(step.name).toBe('completeSetup')
  })

  it('when asked for the next step, stays on completeSetup', () => {
    const installStore = buildInstallStore()
    installStore.step.value = 'completeSetup'

    const step = new CompleteSetupStep(installStore)

    expect(step.nextStep).toBe('completeSetup')
  })

  it('when asked for its view, returns the setup progress', () => {
    const installStore = buildInstallStore()

    const step = new CompleteSetupStep(installStore)

    expect(step.View).toBe(SetupProgress)
  })

  it('when asked for its state, returns the env file input', () => {
    const installStore = buildInstallStore()
    installStore.step.value = 'completeSetup'

    const state = new CompleteSetupStep(installStore).state()

    expect(state).toBe(installStore.envFile)
  })
})
