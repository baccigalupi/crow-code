import { describe, expect, it } from 'bun:test'
import { AdditionalWriteStep } from '../../../../src/tui/install/steps/additional-write.ts'
import { buildUserInputStore } from '../../../support/user-input-store.ts'

describe('AdditionalWriteStep', () => {
  it('when asked for its state, returns the additional write input', () => {
    const userInputStore = buildUserInputStore()
    userInputStore.step.value = 'additionalWrite'

    const step = new AdditionalWriteStep(userInputStore)

    expect(step.name).toBe('additionalWrite')
    expect(step.nextStep).toBe('escalateRead')
    expect(step.state()).toBe(userInputStore.additionalWrite)
  })
})
