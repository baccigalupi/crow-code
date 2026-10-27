import { describe, expect, it } from 'bun:test'
import { createTestRenderer } from '@opentui/core/testing'
import { SetupProgressView } from '../../../../../src/tui/install/views/steps/setup-progress.ts'

describe('SetupProgressView', () => {
  it('when tasks are pending, marks the first one as active', async () => {
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 40, height: 3 },
    )
    const view = new SetupProgressView(renderer)
    renderer.root.add(view.root())
    view.update({
      setupTasks: [
        { id: 'a', label: 'Writing config to a', done: false, error: '' },
        { id: 'b', label: 'Creating b', done: false, error: '' },
      ],
    })

    await renderOnce()

    const lines = captureCharFrame().split('\n')
    expect(lines[0]).toContain('› Writing config to a')
    expect(lines[1]).toContain('  Creating b')
    expect(lines[1]).not.toContain('›')
    renderer.destroy()
  })

  it('when a task finishes, redraws its row in place', async () => {
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 40, height: 3 },
    )
    const view = new SetupProgressView(renderer)
    renderer.root.add(view.root())
    view.update({
      setupTasks: [
        { id: 'a', label: 'A', done: false, error: '' },
        { id: 'b', label: 'B', done: false, error: '' },
      ],
    })
    view.update({
      setupTasks: [
        { id: 'a', label: 'A', done: true, error: '' },
        { id: 'b', label: 'B', done: false, error: '' },
      ],
    })

    await renderOnce()

    expect(captureCharFrame()).toBe(
      ' ✓ A                                    \n › B                                    \n                                        \n',
    )
    renderer.destroy()
  })

  it('when a task failed, marks it failed and no task active', async () => {
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 40, height: 4 },
    )
    const view = new SetupProgressView(renderer)
    renderer.root.add(view.root())
    view.update({
      setupTasks: [
        { id: 'a', label: 'A', done: true, error: '' },
        { id: 'b', label: 'B', done: true, error: 'boom' },
        { id: 'c', label: 'C', done: false, error: '' },
      ],
    })

    await renderOnce()

    expect(captureCharFrame()).toBe(
      ' ✓ A                                    \n ✗ B                                    \n   boom                                 \n   C                                    \n',
    )
    renderer.destroy()
  })
})
