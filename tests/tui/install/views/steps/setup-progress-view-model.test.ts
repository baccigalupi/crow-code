import { describe, expect, it } from 'bun:test'
import { setupProgressViewModel } from '../../../../../src/tui/install/views/steps/setup-progress-view-model.ts'

describe('setupProgressViewModel', () => {
  it('when some tasks are done, marks done, active and pending rows', () => {
    const setupTasks = [
      { id: 'a', label: 'A', done: true },
      { id: 'b', label: 'B', done: false },
      { id: 'c', label: 'C', done: false },
    ]

    const rows = setupProgressViewModel({ setupTasks })

    expect(rows).toEqual([
      { id: 'a', label: 'A', indicator: '✓', done: true },
      { id: 'b', label: 'B', indicator: '›', done: false },
      { id: 'c', label: 'C', indicator: ' ', done: false },
    ])
  })

  it('when no tasks exist, returns no rows', () => {
    const setupTasks: never[] = []

    const rows = setupProgressViewModel({ setupTasks })

    expect(rows).toEqual([])
  })
})
