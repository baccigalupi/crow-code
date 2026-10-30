import { describe, expect, it } from 'bun:test'
import { TextAttributes } from '@opentui/core'
import { createTestRenderer } from '@opentui/core/testing'
import { SetupProgressRowView } from '../../../../../src/tui/install/views/steps/setup-progress-row-view.ts'

describe('SetupProgressRowView', () => {
  it('when the task is pending, shows its indicator and label', async () => {
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 40, height: 2 },
    )
    const view = new SetupProgressRowView(renderer)
    renderer.root.add(view.root())
    view.update({
      id: 'a',
      label: 'Writing config to a',
      indicator: '›',
      done: false,
      error: '',
    })

    await renderOnce()

    expect(captureCharFrame()).toBe(
      '› Writing config to a                   \n                                        \n',
    )
    renderer.destroy()
  })

  it('when the task is done, shows a green check and dims its label', async () => {
    const { renderer, renderOnce, captureSpans } = await createTestRenderer({
      width: 40,
      height: 2,
    })
    const view = new SetupProgressRowView(renderer)
    renderer.root.add(view.root())
    view.update({ id: 'a', label: 'A', indicator: '✓', done: true, error: '' })

    await renderOnce()

    const { spans } = captureSpans().lines[0]
    expect(spans[0].text).toBe('✓')
    expect(spans[0].fg.toInts()).toEqual([76, 175, 80, 255])
    expect(spans[1].text).toBe(' A')
    expect(spans[1].attributes).toBe(TextAttributes.DIM)
    renderer.destroy()
  })

  it('when the task failed, shows a red cross and its dimmed reason beneath', async () => {
    const { renderer, renderOnce, captureCharFrame, captureSpans } =
      await createTestRenderer({ width: 40, height: 2 })
    const view = new SetupProgressRowView(renderer)
    renderer.root.add(view.root())
    view.update({
      id: 'a',
      label: 'A',
      indicator: '✗',
      done: true,
      error: 'boom',
    })

    await renderOnce()

    const [taskLine, reasonLine] = captureSpans().lines
    expect(taskLine.spans[0].text).toBe('✗')
    expect(taskLine.spans[0].fg.toInts()).toEqual([224, 82, 82, 255])
    expect(captureCharFrame()).toContain('\n  boom')
    expect(reasonLine.spans[1].text).toBe('boom')
    expect(reasonLine.spans[1].attributes).toBe(TextAttributes.DIM)
    renderer.destroy()
  })
})
