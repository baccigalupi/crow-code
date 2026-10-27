import { describe, expect, it } from 'bun:test'
import { createTestRenderer } from '@opentui/core/testing'
import { AdditionalWritePromptView } from '../../../../../src/tui/install/views/steps/additional-write-prompt.ts'
import { emptyText, insertText } from '../../../../../src/tui/input-text.ts'

describe('AdditionalWritePromptView', () => {
  it('when nothing is typed, shows the config default', async () => {
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 70, height: 3 },
    )
    const view = new AdditionalWritePromptView(renderer)
    renderer.root.add(view.root())
    view.update({ additionalWrite: emptyText() })

    await renderOnce()

    expect(captureCharFrame()).toContain('Additional write directories: []')
    renderer.destroy()
  })

  it('when directories are typed, shows them instead of the default', async () => {
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 70, height: 3 },
    )
    const view = new AdditionalWritePromptView(renderer)
    renderer.root.add(view.root())
    view.update({ additionalWrite: insertText(emptyText(), '/a, /b') })

    await renderOnce()

    expect(captureCharFrame()).toContain('Additional write directories: /a, /b')
    expect(captureCharFrame()).not.toContain('[]')
    renderer.destroy()
  })
})
