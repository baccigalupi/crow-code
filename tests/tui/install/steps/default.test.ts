import { describe, expect, it } from 'bun:test'
import { DefaultStep } from '../../../../src/tui/install/steps/default.ts'
import { buildUserInputStore } from '../../../support/user-input-store.ts'

describe('DefaultStep', () => {
  it('when asked for the next step, returns confirm', () => {
    const userInputStore = buildUserInputStore()
    userInputStore.step.value = 'completeSetup'

    const step = new DefaultStep(userInputStore)

    expect(step.nextStep).toBe('confirm')
  })

  it('when asked for its view, renders nothing', () => {
    const userInputStore = buildUserInputStore()
    userInputStore.step.value = 'completeSetup'

    const rendered = new DefaultStep(userInputStore).View()

    expect(rendered).toBeNull()
  })

  it('when asked for its state, returns the env file input', () => {
    const userInputStore = buildUserInputStore()
    userInputStore.step.value = 'completeSetup'

    const state = new DefaultStep(userInputStore).state()

    expect(state).toBe(userInputStore.envFile)
  })
})
