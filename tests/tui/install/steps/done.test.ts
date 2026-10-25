import { describe, expect, it } from 'bun:test'
import { DoneStep } from '../../../../src/tui/install/steps/done.ts'
import { DoneMessage } from '../../../../src/tui/install/views/steps/done-message.tsx'
import { buildInstallStore } from '../../../support/install-store.ts'

describe('DoneStep', () => {
  it('when asked for the next step, returns done', () => {
    const installStore = buildInstallStore()
    installStore.step.value = 'done'

    const step = new DoneStep(installStore)

    expect(step.nextStep).toBe('done')
  })

  it('when asked for its view, returns the done message', () => {
    const installStore = buildInstallStore()
    installStore.step.value = 'done'

    const step = new DoneStep(installStore)

    expect(step.View).toBe(DoneMessage)
  })

  it('when asked for its state, returns the env file input', () => {
    const installStore = buildInstallStore()
    installStore.step.value = 'done'

    const state = new DoneStep(installStore).state()

    expect(state).toBe(installStore.envFile)
  })
})
