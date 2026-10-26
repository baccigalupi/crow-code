import { describe, expect, it } from 'bun:test'
import { CompleteSetupStep } from '../../../../src/tui/install/steps/complete-setup.ts'
import { SetupProgress } from '../../../../src/tui/install/views/steps/setup-progress.tsx'
import { buildUserInputStore } from '../../../support/user-input-store.ts'

describe('CompleteSetupStep', () => {
  it('when asked for its name, returns completeSetup', () => {
    const userInputStore = buildUserInputStore()

    const step = new CompleteSetupStep(userInputStore)

    expect(step.name).toBe('completeSetup')
  })

  it('when asked for the next step, stays on completeSetup', () => {
    const userInputStore = buildUserInputStore()
    userInputStore.step.value = 'completeSetup'

    const step = new CompleteSetupStep(userInputStore)

    expect(step.nextStep).toBe('completeSetup')
  })

  it('when asked for its view, returns the setup progress', () => {
    const userInputStore = buildUserInputStore()

    const step = new CompleteSetupStep(userInputStore)

    expect(step.View).toBe(SetupProgress)
  })

  it('when asked for its state, returns the env file input', () => {
    const userInputStore = buildUserInputStore()
    userInputStore.step.value = 'completeSetup'

    const state = new CompleteSetupStep(userInputStore).state()

    expect(state).toBe(userInputStore.envFile)
  })
})
