import { describe, expect, it } from 'bun:test'
import {
  initialUserInputState,
  userInputStore,
} from '../../../../../src/tui/install/interactions/state/config-text.ts'

describe('config-text', () => {
  it('when asked for the initial state, returns the default of every field', () => {
    const expected = { step: 'repo', confirmation: true, providers: [] }

    const state = initialUserInputState()

    expect(state).toMatchObject(expected)
    expect(state.envBuffer).toEqual({})
    expect(state.repoDirectory.text).toBe('')
  })

  it('when read, the install store holds the initial values', () => {
    const store = userInputStore

    const stored = { step: store.step.peek(), flag: store.confirmation.peek() }

    expect(stored).toEqual({ step: 'repo', flag: true })
  })
})
