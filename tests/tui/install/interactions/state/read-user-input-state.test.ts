import { describe, expect, it } from 'bun:test'
import { effect } from '@preact/signals-core'
import { readUserInputState } from '../../../../../src/tui/install/interactions/state/read-user-input-state.ts'
import { insertText, emptyText } from '../../../../../src/tui/input-text.ts'
import { buildUserInputStore } from '../../../../support/user-input-store.ts'

describe('readUserInputState', () => {
  it('returns the current value of each field', () => {
    const store = buildUserInputStore()
    store.repoDirectory.value = insertText(emptyText(), 'a')
    store.step.value = 'envFile'

    const state = readUserInputState(store)

    expect(state.repoDirectory.text).toBe('a')
    expect(state.step).toBe('envFile')
  })

  it('does not subscribe the enclosing effect to any field', () => {
    const store = buildUserInputStore()
    let runs = 0
    const stop = effect(() => {
      runs += 1
      readUserInputState(store)
    })

    store.repoDirectory.value = insertText(emptyText(), 'b')

    expect(runs).toBe(1)
    stop()
  })
})
