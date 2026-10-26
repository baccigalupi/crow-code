import { describe, expect, it } from 'bun:test'
import { AllowedLocalScriptsStep } from '../../../../src/tui/install/steps/allowed-local-scripts.ts'
import { buildUserInputStore } from '../../../support/user-input-store.ts'

describe('AllowedLocalScriptsStep', () => {
  it('when finished, moves on to the provider name', () => {
    const userInputStore = buildUserInputStore()
    userInputStore.step.value = 'allowedLocalScripts'

    const step = new AllowedLocalScriptsStep(userInputStore)

    expect(step.nextStep).toBe('providerName')
  })
})
