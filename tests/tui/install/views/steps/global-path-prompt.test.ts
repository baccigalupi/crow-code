import { describe, expect, it } from 'bun:test'
import { createTestRenderer } from '@opentui/core/testing'
import { GlobalPathPromptView } from '../../../../../src/tui/install/views/steps/global-path-prompt.ts'
import { emptyText } from '../../../../../src/tui/input-text.ts'

describe('GlobalPathPromptView', () => {
  it('when rendered, shows the default global directory', async () => {
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 70, height: 3 },
    )
    const view = new GlobalPathPromptView(renderer)
    renderer.root.add(view.root())
    view.update({ globalDirectory: emptyText() })

    await renderOnce()

    expect(captureCharFrame()).toContain('User crow directory: (~/.crow)')
    renderer.destroy()
  })
})
