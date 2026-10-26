import { describe, expect, it } from 'bun:test'
import { DoneStep } from '../../../../src/tui/install/steps/done.ts'
import { DoneMessage } from '../../../../src/tui/install/views/steps/done-message.tsx'
import { buildUserInputStore } from '../../../support/user-input-store.ts'

describe('DoneStep', () => {
  it('when asked for the next step, returns done', () => {
    const userInputStore = buildUserInputStore()
    userInputStore.step.value = 'done'

    const step = new DoneStep(userInputStore)

    expect(step.nextStep).toBe('done')
  })

  it('when asked for its view, returns the done message', () => {
    const userInputStore = buildUserInputStore()
    userInputStore.step.value = 'done'

    const step = new DoneStep(userInputStore)

    expect(step.View).toBe(DoneMessage)
  })

  it('when asked for its state, returns the env file input', () => {
    const userInputStore = buildUserInputStore()
    userInputStore.step.value = 'done'

    const state = new DoneStep(userInputStore).state()

    expect(state).toBe(userInputStore.envFile)
  })
})
