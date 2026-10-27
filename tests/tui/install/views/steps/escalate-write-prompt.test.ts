import { describe, expect, it } from 'bun:test'
import { createTestRenderer } from '@opentui/core/testing'
import { EscalateWritePromptView } from '../../../../../src/tui/install/views/steps/escalate-write-prompt.ts'
import { emptyText, insertText } from '../../../../../src/tui/input-text.ts'

describe('EscalateWritePromptView', () => {
  it('when nothing is typed, shows the default write directories', async () => {
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 70, height: 3 },
    )
    const view = new EscalateWritePromptView(renderer)
    renderer.root.add(view.root())
    view.update({ escalateWrite: emptyText() })

    await renderOnce()

    expect(captureCharFrame()).toContain(
      'Escalate write directories: (./dev, ./agent)',
    )
    renderer.destroy()
  })

  it('when directories are typed, shows them instead of the default', async () => {
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 70, height: 3 },
    )
    const view = new EscalateWritePromptView(renderer)
    renderer.root.add(view.root())
    view.update({ escalateWrite: insertText(emptyText(), './scripts') })

    await renderOnce()

    expect(captureCharFrame()).toContain(
      'Escalate write directories: ./scripts',
    )
    expect(captureCharFrame()).not.toContain('./dev')
    renderer.destroy()
  })
})
