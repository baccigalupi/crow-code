import { describe, expect, it } from 'bun:test'
import { EscalateWriteStep } from '../../../../src/tui/install/steps/escalate-write.ts'
import { buildUserInputStore } from '../../../support/user-input-store.ts'

describe('EscalateWriteStep', () => {
  it('when asked for its state, returns the escalate write input', () => {
    const userInputStore = buildUserInputStore()
    userInputStore.step.value = 'escalateWrite'

    const state = new EscalateWriteStep(userInputStore).state()

    expect(state).toBe(userInputStore.escalateWrite)
  })
})
