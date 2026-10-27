import { describe, expect, it } from 'bun:test'
import { ConfirmStore } from '../../../../src/tui/install/data-stores/confirm-store.ts'

describe('ConfirmStore', () => {
  it('when built, answers yes', () => {
    const confirm = new ConfirmStore()

    const confirmed = confirm.confirmed.peek()

    expect(confirmed).toBe(true)
  })

  it('when no is chosen, answers no', () => {
    const confirm = new ConfirmStore()

    confirm.choose(false)

    expect(confirm.confirmed.peek()).toBe(false)
  })
})
