import { describe, expect, it } from 'bun:test'
import { EscalateWriteStep } from '../../../../src/tui/install/steps/escalate-write.ts'
import { buildInstallStore } from '../../../support/install-store.ts'

describe('EscalateWriteStep', () => {
  it('when asked for its state, returns the escalate write input', () => {
    const installStore = buildInstallStore()
    installStore.step.value = 'escalateWrite'

    const state = new EscalateWriteStep(installStore).state()

    expect(state).toBe(installStore.escalateWrite)
  })
})
