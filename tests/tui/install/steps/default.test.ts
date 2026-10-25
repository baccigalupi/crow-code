import { describe, expect, it } from 'bun:test'
import { DefaultStep } from '../../../../src/tui/install/steps/default.ts'
import { buildInstallStore } from '../../../support/install-store.ts'

describe('DefaultStep', () => {
  it('when asked for the next step, returns confirm', () => {
    const installStore = buildInstallStore()
    installStore.step.value = 'write'

    const step = new DefaultStep(installStore)

    expect(step.nextStep).toBe('confirm')
  })

  it('when asked for its view, renders nothing', () => {
    const installStore = buildInstallStore()
    installStore.step.value = 'write'

    const rendered = new DefaultStep(installStore).View()

    expect(rendered).toBeNull()
  })

  it('when asked for its state, returns the env file input', () => {
    const installStore = buildInstallStore()
    installStore.step.value = 'write'

    const state = new DefaultStep(installStore).state()

    expect(state).toBe(installStore.envFile)
  })
})
