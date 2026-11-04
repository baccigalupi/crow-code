import { describe, expect, it } from 'bun:test'
import { DoneMessageViewModel } from '../../../../src/tui/install/done/done-message-view-model.ts'

describe('DoneMessageViewModel', () => {
  it('when no task failed, the summary says done', () => {
    const viewModel = new DoneMessageViewModel([
      { id: 'A', label: 'a', done: true, error: '', state: 'done' },
    ])

    const summary = viewModel.summary()

    expect(summary).toBe('Done! Press any key to exit')
  })

  it('when a task failed, the summary says setup failed', () => {
    const viewModel = new DoneMessageViewModel([
      { id: 'A', label: 'a', done: true, error: 'boom', state: 'failed' },
    ])

    const summary = viewModel.summary()

    expect(summary).toBe('Setup failed. Press any key to exit')
  })
})
