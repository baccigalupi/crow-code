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

  describe('rows', () => {
    it('when nothing has finished, the first task is running and the rest wait', () => {
      const progress = new SetupProgressStore()

      progress.list([
        { id: 'A', label: 'a', done: false, error: '' },
        { id: 'B', label: 'b', done: false, error: '' },
      ])

      expect(progress.rows.peek()).toEqual([
        { id: 'A', label: 'a', done: false, error: '', state: 'running' },
        { id: 'B', label: 'b', done: false, error: '', state: 'waiting' },
      ])
    })

    it('when the first task is done, it is done and the next is running', () => {
      const progress = new SetupProgressStore()
      progress.list([
        { id: 'A', label: 'a', done: false, error: '' },
        { id: 'B', label: 'b', done: false, error: '' },
      ])

      progress.finish('A', '')

      expect(progress.rows.peek()).toEqual([
        { id: 'A', label: 'a', done: true, error: '', state: 'done' },
        { id: 'B', label: 'b', done: false, error: '', state: 'running' },
      ])
    })

    it('when a task fails, it is failed and nothing is running', () => {
      const progress = new SetupProgressStore()
      progress.list([
        { id: 'A', label: 'a', done: false, error: '' },
        { id: 'B', label: 'b', done: false, error: '' },
      ])

      progress.finish('A', 'boom')

      expect(progress.rows.peek()).toEqual([
        { id: 'A', label: 'a', done: true, error: 'boom', state: 'failed' },
        { id: 'B', label: 'b', done: false, error: '', state: 'waiting' },
      ])
    })
  })
})
