import { describe, expect, it } from 'bun:test'
import { effect } from '@preact/signals-core'
import { readInstallState } from '../../../../../src/tui/install/interactions/state/read-install-state.ts'
import { insertText, emptyText } from '../../../../../src/tui/input-text.ts'
import { buildInstallStore } from '../../../../support/install-store.ts'

describe('readInstallState', () => {
  it('returns the current value of each field', () => {
    const store = buildInstallStore()
    store.repoDirectory.value = insertText(emptyText(), 'a')
    store.step.value = 'envFile'

    const state = readInstallState(store)

    expect(state.repoDirectory.text).toBe('a')
    expect(state.step).toBe('envFile')
  })

  it('does not subscribe the enclosing effect to any field', () => {
    const store = buildInstallStore()
    let runs = 0
    const stop = effect(() => {
      runs += 1
      readInstallState(store)
    })

    store.repoDirectory.value = insertText(emptyText(), 'b')

    expect(runs).toBe(1)
    stop()
  })
})
