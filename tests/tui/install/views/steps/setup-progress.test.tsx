/** @jsxImportSource @opentui/react */
import { describe, expect, it } from 'bun:test'
import { TextAttributes } from '@opentui/core'
import { testRender } from '@opentui/react/test-utils'
import { SetupProgress } from '../../../../../src/tui/install/views/steps/setup-progress.tsx'

describe('SetupProgress', () => {
  it('when tasks are pending, marks the first one as active', async () => {
    const setupTasks = [
      { id: 'a', label: 'Writing config to a', done: false },
      { id: 'b', label: 'Creating b', done: false },
    ]
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <SetupProgress setupTasks={setupTasks} />,
      { width: 40, height: 3 },
    )

    await renderOnce()

    const lines = captureCharFrame().split('\n')
    expect(lines[0]).toContain('› Writing config to a')
    expect(lines[1]).toContain('  Creating b')
    expect(lines[1]).not.toContain('›')
    renderer.destroy()
  })

  it('when a task is done, shows a green check and dims its label', async () => {
    const setupTasks = [
      { id: 'a', label: 'A', done: true },
      { id: 'b', label: 'B', done: false },
    ]
    const { renderer, renderOnce, captureSpans } = await testRender(
      <SetupProgress setupTasks={setupTasks} />,
      { width: 40, height: 3 },
    )

    await renderOnce()

    const { spans } = captureSpans().lines[0]
    expect(spans[1].text).toBe('✓')
    expect(spans[1].fg.toInts()).toEqual([76, 175, 80, 255])
    expect(spans[2].text).toBe(' A')
    expect(spans[2].attributes).toBe(TextAttributes.DIM)
    renderer.destroy()
  })
})
