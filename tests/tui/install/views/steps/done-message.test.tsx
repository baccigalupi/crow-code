/** @jsxImportSource @opentui/react */
import { describe, expect, it } from 'bun:test'
import { TextAttributes } from '@opentui/core'
import { testRender } from '@opentui/react/test-utils'
import { DoneMessage } from '../../../../../src/tui/install/views/steps/done-message.tsx'

describe('DoneMessage', () => {
  it('when rendered, keeps the finished tasks and dims the exit hint', async () => {
    const setupTasks = [
      {
        id: 'LocalConfigTask',
        label: 'Writing config to .crow/config.json',
        done: true,
        error: '',
      },
      {
        id: 'GlobalDirectoryTask',
        label: 'Creating ~/.crow',
        done: true,
        error: '',
      },
    ]
    const { renderer, renderOnce, captureCharFrame, captureSpans } =
      await testRender(<DoneMessage setupTasks={setupTasks} />, {
        width: 40,
        height: 4,
      })

    await renderOnce()

    expect(captureCharFrame()).toContain(
      '✓ Writing config to .crow/config.json',
    )
    expect(captureCharFrame()).toContain('✓ Creating ~/.crow')
    expect(captureCharFrame()).not.toContain('Wrote config')
    const { spans } = captureSpans().lines[2]
    expect(spans[1].text).toBe('Done! Press any key to exit')
    expect(spans[1].attributes).toBe(TextAttributes.DIM)
    renderer.destroy()
  })
})
