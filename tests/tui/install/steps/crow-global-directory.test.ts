import { describe, expect, it } from 'bun:test'
import { CrowGlobalDirectoryStep } from '../../../../src/tui/install/steps/crow-global-directory.ts'
import { buildUserInputStore } from '../../../support/user-input-store.ts'

describe('CrowGlobalDirectoryStep', () => {
  it('when asked for its state, returns the global directory input', () => {
    const userInputStore = buildUserInputStore()
    userInputStore.step.value = 'crowGlobalDirectory'

    const state = new CrowGlobalDirectoryStep(userInputStore).state()

    expect(state).toBe(userInputStore.globalDirectory)
  })
})
