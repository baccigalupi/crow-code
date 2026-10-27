import { describe, expect, it } from 'bun:test'
import { createTestRenderer } from '@opentui/core/testing'
import { AdditionalReadPromptView } from '../../../../../src/tui/install/views/steps/additional-read-prompt.ts'
import { emptyText, insertText } from '../../../../../src/tui/input-text.ts'

describe('AdditionalReadPromptView', () => {
  it('when nothing is typed, shows the config default', async () => {
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 70, height: 3 },
    )
    const view = new AdditionalReadPromptView(renderer)
    renderer.root.add(view.root())
    view.update({ additionalRead: emptyText() })

    await renderOnce()

    expect(captureCharFrame()).toContain('Additional read directories: []')
    renderer.destroy()
  })

  it('when directories are typed, shows them instead of the default', async () => {
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 70, height: 3 },
    )
    const view = new AdditionalReadPromptView(renderer)
    renderer.root.add(view.root())
    view.update({ additionalRead: insertText(emptyText(), '/docs, ~/notes') })

    await renderOnce()

    expect(captureCharFrame()).toContain(
      'Additional read directories: /docs, ~/notes',
    )
    expect(captureCharFrame()).not.toContain('[]')
    renderer.destroy()
  })
})
