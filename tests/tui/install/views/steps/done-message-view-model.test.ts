import { describe, expect, it } from 'bun:test'
import { doneMessageViewModel } from '../../../../../src/tui/install/views/steps/done-message-view-model.ts'

describe('doneMessageViewModel', () => {
  it('when every task is done, says done', () => {
    const setupTasks = [{ id: 'a', label: 'A', done: true, error: '' }]

    const viewModel = doneMessageViewModel({ setupTasks })

    expect(viewModel).toEqual({ exitMessage: 'Done! Press any key to exit' })
  })

  it('when a task failed, says setup failed', () => {
    const setupTasks = [{ id: 'a', label: 'A', done: true, error: 'boom' }]

    const viewModel = doneMessageViewModel({ setupTasks })

    expect(viewModel).toEqual({
      exitMessage: 'Setup failed. Press any key to exit',
    })
  })
})
