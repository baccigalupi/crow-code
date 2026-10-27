import { describe, expect, it } from 'bun:test'
import { createTestRenderer } from '@opentui/core/testing'
import { IgnorePromptView } from '../../../../../src/tui/install/views/steps/ignore-prompt.ts'
import { emptyText, insertText } from '../../../../../src/tui/input-text.ts'

describe('IgnorePromptView', () => {
  it('when nothing is typed, shows the config default', async () => {
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 70, height: 3 },
    )
    const view = new IgnorePromptView(renderer)
    renderer.root.add(view.root())
    view.update({ ignore: emptyText() })

    await renderOnce()

    expect(captureCharFrame()).toContain('Ignored paths: []')
    renderer.destroy()
  })

  it('when paths are typed, shows them instead of the default', async () => {
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 70, height: 3 },
    )
    const view = new IgnorePromptView(renderer)
    renderer.root.add(view.root())
    view.update({ ignore: insertText(emptyText(), '.env, secrets/') })

    await renderOnce()

    expect(captureCharFrame()).toContain('Ignored paths: .env, secrets/')
    expect(captureCharFrame()).not.toContain('[]')
    renderer.destroy()
  })
})
