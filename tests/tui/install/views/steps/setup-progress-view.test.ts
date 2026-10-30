import { describe, expect, it } from 'bun:test'
import { createTestRenderer } from '@opentui/core/testing'
import { SetupProgressView } from '../../../../../src/tui/install/views/steps/setup-progress-view.ts'

describe('SetupProgressView', () => {
  it('when given rows, draws each with its indicator', async () => {
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 40, height: 3 },
    )
    const view = new SetupProgressView(renderer)
    renderer.root.add(view.root())
    view.update({
      rows: [
        {
          id: 'a',
          label: 'Writing config to a',
          done: false,
          error: '',
          indicator: '›',
        },
        {
          id: 'b',
          label: 'Creating b',
          done: false,
          error: '',
          indicator: ' ',
        },
      ],
    })

    await renderOnce()

    const lines = captureCharFrame().split('\n')
    expect(lines[0]).toContain('› Writing config to a')
    expect(lines[1]).toContain('  Creating b')
    expect(lines[1]).not.toContain('›')
    renderer.destroy()
  })

  it('when a row changes, redraws it in place', async () => {
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 40, height: 3 },
    )
    const view = new SetupProgressView(renderer)
    renderer.root.add(view.root())
    view.update({
      rows: [
        { id: 'a', label: 'A', done: false, error: '', indicator: '›' },
        { id: 'b', label: 'B', done: false, error: '', indicator: ' ' },
      ],
    })
    view.update({
      rows: [
        { id: 'a', label: 'A', done: true, error: '', indicator: '✓' },
        { id: 'b', label: 'B', done: false, error: '', indicator: '›' },
      ],
    })

    await renderOnce()

    expect(captureCharFrame()).toBe(
      ' ✓ A                                    \n › B                                    \n                                        \n',
    )
    renderer.destroy()
  })

  it('when a row failed, draws its reason beneath it', async () => {
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 40, height: 4 },
    )
    const view = new SetupProgressView(renderer)
    renderer.root.add(view.root())
    view.update({
      rows: [
        { id: 'a', label: 'A', done: true, error: '', indicator: '✓' },
        { id: 'b', label: 'B', done: true, error: 'boom', indicator: '✗' },
        { id: 'c', label: 'C', done: false, error: '', indicator: ' ' },
      ],
    })

    await renderOnce()

    expect(captureCharFrame()).toBe(
      ' ✓ A                                    \n ✗ B                                    \n   boom                                 \n   C                                    \n',
    )
    renderer.destroy()
  })
})
