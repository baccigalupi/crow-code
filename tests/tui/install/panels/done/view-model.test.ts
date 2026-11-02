import { describe, expect, it } from 'bun:test'
import { DoneMessageViewModel } from '../../../../../src/tui/install/panels/done/view-model.ts'
import { SetupProgressViewModel } from '../../../../../src/tui/install/panels/shared/setup-progress-view-model.ts'

describe('DoneMessageViewModel', () => {
  it('when every task succeeded, says done', () => {
    const viewModel = new DoneMessageViewModel(new SetupProgressViewModel())

    const props = viewModel.props({
      setupTasks: [{ id: 'a', label: 'A', done: true, error: '' }],
    })

    expect(props.hint).toBe('Done! Press any key to exit')
    expect(props.rows).toEqual([
      { id: 'a', label: 'A', done: true, error: '', indicator: '✓' },
    ])
  })

  it('when a task failed, says setup failed', () => {
    const viewModel = new DoneMessageViewModel(new SetupProgressViewModel())

    const props = viewModel.props({
      setupTasks: [{ id: 'a', label: 'A', done: true, error: 'boom' }],
    })

    expect(props.hint).toBe('Setup failed. Press any key to exit')
  })
})
