import { describe, expect, it } from 'bun:test'
import { createTestRenderer } from '@opentui/core/testing'
import { RepoPathPromptView } from '../../../../../src/tui/install/views/steps/repo-path-prompt.ts'
import { emptyText } from '../../../../../src/tui/input-text.ts'

describe('RepoPathPromptView', () => {
  it('when rendered, shows the default repo directory', async () => {
    const { renderer, renderOnce, captureCharFrame } = await createTestRenderer(
      { width: 70, height: 3 },
    )
    const view = new RepoPathPromptView(renderer)
    renderer.root.add(view.root())
    view.update({ repoDirectory: emptyText() })

    await renderOnce()

    expect(captureCharFrame()).toContain(
      'What directory for the local repo crow setup: (.crow)',
    )
    renderer.destroy()
  })
})
