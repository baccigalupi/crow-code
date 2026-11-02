import { describe, expect, it } from 'bun:test'
import { createTestRenderer } from '@opentui/core/testing'
import { ConfirmPromptView } from '../../../../../src/tui/install/panels/confirm/view.ts'

describe('ConfirmPromptView', () => {
  it('when confirmed, asks to complete setup with Yes selected', async () => {
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 70, height: 4 },
    )
    const view = new ConfirmPromptView(renderer)
    renderer.root.add(view.root())
    view.update({ selectedIndex: 0 })

    await renderOnce()

    expect(captureCharFrame()).toContain('Complete setup?')
    expect(captureCharFrame()).toContain('▶ Yes')
    expect(captureCharFrame()).toContain('No')
    renderer.destroy()
  })

  it('when declined, selects No', async () => {
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 70, height: 4 },
    )
    const view = new ConfirmPromptView(renderer)
    renderer.root.add(view.root())
    view.update({ selectedIndex: 1 })

    await renderOnce()

    expect(captureCharFrame()).toContain('▶ No')
    expect(captureCharFrame()).not.toContain('▶ Yes')
    renderer.destroy()
  })
})
