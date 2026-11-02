import { describe, expect, it } from 'bun:test'
import { SetupProgressStore } from '../../../../src/tui/install/data-stores/setup-progress-store.ts'

describe('SetupProgressStore', () => {
  it('when built, lists no tasks', () => {
    const progress = new SetupProgressStore()

    const tasks = progress.tasks.peek()

    expect(tasks).toEqual([])
  })

  it('when tasks are listed, they are shown as given', () => {
    const progress = new SetupProgressStore()

    progress.list([
      { id: 'A', label: 'a', done: false, error: '' },
      { id: 'B', label: 'b', done: false, error: '' },
    ])

    expect(progress.tasks.peek()).toEqual([
      { id: 'A', label: 'a', done: false, error: '' },
      { id: 'B', label: 'b', done: false, error: '' },
    ])
  })

  it('when a task finishes, only that task is done with its error', () => {
    const progress = new SetupProgressStore()
    progress.list([
      { id: 'A', label: 'a', done: false, error: '' },
      { id: 'B', label: 'b', done: false, error: '' },
    ])

    progress.finish('A', 'boom')

    expect(progress.tasks.peek()).toEqual([
      { id: 'A', label: 'a', done: true, error: 'boom' },
      { id: 'B', label: 'b', done: false, error: '' },
    ])
  })
})
