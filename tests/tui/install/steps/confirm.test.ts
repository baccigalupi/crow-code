import { describe, expect, it } from 'bun:test'
import { ConfirmStep } from '../../../../src/tui/install/steps/confirm.ts'
import { ConfirmPrompt } from '../../../../src/tui/install/views/steps/confirm-prompt.tsx'
import { buildUserInputStore } from '../../../support/user-input-store.ts'

describe('ConfirmStep', () => {
  it('when asked for the next step, returns completeSetup', () => {
    const userInputStore = buildUserInputStore()
    userInputStore.step.value = 'confirm'

    const step = new ConfirmStep(userInputStore)

    expect(step.nextStep).toBe('completeSetup')
  })

  it('when asked for its view, returns the confirm prompt', () => {
    const userInputStore = buildUserInputStore()
    userInputStore.step.value = 'confirm'

    const step = new ConfirmStep(userInputStore)

    expect(step.View).toBe(ConfirmPrompt)
  })

  it('when asked for its state, returns the env file input', () => {
    const userInputStore = buildUserInputStore()
    userInputStore.step.value = 'confirm'

    const state = new ConfirmStep(userInputStore).state()

    expect(state).toBe(userInputStore.envFile)
  })
})
