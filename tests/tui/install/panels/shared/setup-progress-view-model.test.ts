import { describe, expect, it } from 'bun:test'
import { SetupProgressViewModel } from '../../../../../src/tui/install/panels/shared/setup-progress-view-model.ts'

describe('SetupProgressViewModel', () => {
  it('when some tasks are done, checks them and marks the first unfinished as running', () => {
    const viewModel = new SetupProgressViewModel()

    const props = viewModel.props({
      setupTasks: [
        { id: 'a', label: 'First', done: true, error: '' },
        { id: 'b', label: 'Second', done: false, error: '' },
        { id: 'c', label: 'Third', done: false, error: '' },
      ],
    })

    expect(props.rows).toEqual([
      { id: 'a', label: 'First', done: true, error: '', indicator: '✓' },
      { id: 'b', label: 'Second', done: false, error: '', indicator: '›' },
      { id: 'c', label: 'Third', done: false, error: '', indicator: ' ' },
    ])
  })

  it('when a task failed, marks it failed and nothing as running', () => {
    const viewModel = new SetupProgressViewModel()

    const props = viewModel.props({
      setupTasks: [
        { id: 'a', label: 'First', done: true, error: '' },
        { id: 'b', label: 'Second', done: false, error: 'boom' },
        { id: 'c', label: 'Third', done: false, error: '' },
      ],
    })

    expect(props.rows).toEqual([
      { id: 'a', label: 'First', done: true, error: '', indicator: '✓' },
      { id: 'b', label: 'Second', done: false, error: 'boom', indicator: '✗' },
      { id: 'c', label: 'Third', done: false, error: '', indicator: ' ' },
    ])
  })

  it('when every task is done, marks nothing as running', () => {
    const viewModel = new SetupProgressViewModel()

    const props = viewModel.props({
      setupTasks: [{ id: 'a', label: 'First', done: true, error: '' }],
    })

    expect(props.rows).toEqual([
      { id: 'a', label: 'First', done: true, error: '', indicator: '✓' },
    ])
  })
})
