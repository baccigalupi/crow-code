import { describe, expect, it } from 'bun:test'
import { SetupProgressStore } from '../../../../src/tui/install/data-stores/setup-progress-store.ts'

describe('SetupProgressStore', () => {
  it('when built, no task is finished', () => {
    const progress = new SetupProgressStore()

    const finished = progress.finished.peek()

    expect(finished).toEqual([])
  })

  it('when tasks finish, lists them in finishing order', () => {
    const progress = new SetupProgressStore()
    const first = { reason: '', label: () => 'first' }
    const second = { reason: '', label: () => 'second' }

    progress.finish(first)
    progress.finish(second)

    expect(progress.finished.peek()).toEqual([first, second])
  })
})
