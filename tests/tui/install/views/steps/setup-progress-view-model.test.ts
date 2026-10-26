import { describe, expect, it } from 'bun:test'
import { setupProgressViewModel } from '../../../../../src/tui/install/views/steps/setup-progress-view-model.ts'

describe('setupProgressViewModel', () => {
  it('when some tasks are done, marks done, active and pending rows', () => {
    const setupTasks = [
      { id: 'a', label: 'A', done: true, error: '' },
      { id: 'b', label: 'B', done: false, error: '' },
      { id: 'c', label: 'C', done: false, error: '' },
    ]

    const rows = setupProgressViewModel({ setupTasks })

    expect(rows).toEqual([
      { id: 'a', label: 'A', indicator: '✓', done: true, error: '' },
      { id: 'b', label: 'B', indicator: '›', done: false, error: '' },
      { id: 'c', label: 'C', indicator: ' ', done: false, error: '' },
    ])
  })

  it('when a task failed, marks it failed and no row active', () => {
    const setupTasks = [
      { id: 'a', label: 'A', done: true, error: '' },
      { id: 'b', label: 'B', done: true, error: 'boom' },
      { id: 'c', label: 'C', done: false, error: '' },
    ]

    const rows = setupProgressViewModel({ setupTasks })

    expect(rows).toEqual([
      { id: 'a', label: 'A', indicator: '✓', done: true, error: '' },
      { id: 'b', label: 'B', indicator: '✗', done: true, error: 'boom' },
      { id: 'c', label: 'C', indicator: ' ', done: false, error: '' },
    ])
  })

  it('when no tasks exist, returns no rows', () => {
    const setupTasks: never[] = []

    const rows = setupProgressViewModel({ setupTasks })

    expect(rows).toEqual([])
  })
})
