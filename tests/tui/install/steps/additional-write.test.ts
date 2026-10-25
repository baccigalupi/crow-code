import { describe, expect, it } from 'bun:test'
import { AdditionalWriteStep } from '../../../../src/tui/install/steps/additional-write.ts'
import { buildInstallStore } from '../../../support/install-store.ts'

describe('AdditionalWriteStep', () => {
  it('when asked for its state, returns the additional write input', () => {
    const installStore = buildInstallStore()
    installStore.step.value = 'additionalWrite'

    const step = new AdditionalWriteStep(installStore)

    expect(step.name).toBe('additionalWrite')
    expect(step.nextStep).toBe('escalateRead')
    expect(step.state()).toBe(installStore.additionalWrite)
  })
})
