import { describe, expect, it } from 'bun:test'
import { createTestRenderer } from '@opentui/core/testing'
import { EscalateReadPromptView } from '../../../../../src/tui/install/views/steps/escalate-read-prompt.ts'
import { emptyText, insertText } from '../../../../../src/tui/input-text.ts'

describe('EscalateReadPromptView', () => {
  it('when nothing is typed, shows the config default', async () => {
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 70, height: 3 },
    )
    const view = new EscalateReadPromptView(renderer)
    renderer.root.add(view.root())
    view.update({ escalateRead: emptyText() })

    await renderOnce()

    expect(captureCharFrame()).toContain('Escalate read directories: []')
    renderer.destroy()
  })

  it('when directories are typed, shows them instead of the default', async () => {
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 70, height: 3 },
    )
    const view = new EscalateReadPromptView(renderer)
    renderer.root.add(view.root())
    view.update({ escalateRead: insertText(emptyText(), '/docs, ~/notes') })

    await renderOnce()

    expect(captureCharFrame()).toContain(
      'Escalate read directories: /docs, ~/notes',
    )
    expect(captureCharFrame()).not.toContain('[]')
    renderer.destroy()
  })
})
