import { describe, expect, it } from 'bun:test'
import { TextAttributes } from '@opentui/core'
import { createTestRenderer } from '@opentui/core/testing'
import { DoneMessageView } from '../../../../../src/tui/install/panels/done/view.ts'

describe('DoneMessageView', () => {
  it('when rendered, keeps the finished rows and dims the hint', async () => {
    const { renderer, renderOnce, captureCharFrame, captureSpans } =
      await createTestRenderer({ width: 40, height: 4 })
    const view = new DoneMessageView(renderer)
    renderer.root.add(view.root())
    view.update({
      hint: 'Done! Press any key to exit',
      rows: [
        {
          id: 'LocalConfigTask',
          label: 'Writing config to .crow/config.json',
          done: true,
          error: '',
          indicator: '✓',
        },
        {
          id: 'GlobalDirectoryTask',
          label: 'Creating ~/.crow',
          done: true,
          error: '',
          indicator: '✓',
        },
      ],
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

  it('when given a failure hint, shows it', async () => {
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 40, height: 4 },
    )
    const view = new DoneMessageView(renderer)
    renderer.root.add(view.root())
    view.update({
      hint: 'Setup failed. Press any key to exit',
      rows: [
        { id: 'a', label: 'A', done: true, error: 'boom', indicator: '✗' },
      ],
    })

    await renderOnce()

    expect(captureCharFrame()).toContain('Setup failed. Press any key to exit')
    renderer.destroy()
  })
})
