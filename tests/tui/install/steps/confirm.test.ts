import { describe, expect, it } from 'bun:test'
import { ConfirmStep } from '../../../../src/tui/install/steps/confirm.ts'
import { ConfirmPrompt } from '../../../../src/tui/install/views/steps/confirm-prompt.tsx'
import { buildInstallStore } from '../../../support/install-store.ts'

describe('ConfirmStep', () => {
  it('when asked for the next step, returns write', () => {
    const installStore = buildInstallStore()
    installStore.step.value = 'confirm'

    const step = new ConfirmStep(installStore)

    expect(step.nextStep).toBe('write')
  })

  it('when asked for its view, returns the confirm prompt', () => {
    const installStore = buildInstallStore()
    installStore.step.value = 'confirm'

    const step = new ConfirmStep(installStore)

    expect(step.View).toBe(ConfirmPrompt)
  })

  it('when asked for its state, returns the env file input', () => {
    const installStore = buildInstallStore()
    installStore.step.value = 'confirm'

    const state = new ConfirmStep(installStore).state()

    expect(state).toBe(installStore.envFile)
  })
})
