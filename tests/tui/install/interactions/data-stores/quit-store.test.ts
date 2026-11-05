import { describe, expect, it } from 'bun:test'
import { QuitStore } from '../../../../../src/tui/install/interactions/data-stores/quit-store.ts'

describe('QuitStore', () => {
  it('when built, no quit is requested', () => {
    const quit = new QuitStore()

    const requested = quit.requested.peek()

    expect(requested).toBe(false)
  })

  it('when a quit is requested, requested turns true', () => {
    const quit = new QuitStore()

    quit.request()

    expect(quit.requested.peek()).toBe(true)
  })
})
