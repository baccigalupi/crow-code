import { describe, expect, it } from 'bun:test'
import { createTestRenderer } from '@opentui/core/testing'
import { AllowedLocalScriptsPromptView } from '../../../../../src/tui/install/views/steps/allowed-local-scripts-prompt.ts'
import { emptyText, insertText } from '../../../../../src/tui/input-text.ts'

describe('AllowedLocalScriptsPromptView', () => {
  it('when nothing is typed, shows the default scripts', async () => {
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 70, height: 3 },
    )
    const view = new AllowedLocalScriptsPromptView(renderer)
    renderer.root.add(view.root())
    view.update({ allowedLocalScripts: emptyText() })

    await renderOnce()

    expect(captureCharFrame()).toContain(
      'Allowed local scripts: (./dev/*, ./agent/*)',
    )
    renderer.destroy()
  })

  it('when scripts are typed, shows them instead of the default', async () => {
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 70, height: 3 },
    )
    const view = new AllowedLocalScriptsPromptView(renderer)
    renderer.root.add(view.root())
    view.update({
      allowedLocalScripts: insertText(emptyText(), './a.sh, ./b.sh'),
    })

    await renderOnce()

    expect(captureCharFrame()).toContain(
      'Allowed local scripts: ./a.sh, ./b.sh',
    )
    expect(captureCharFrame()).not.toContain('./dev/*')
    renderer.destroy()
  })
})
