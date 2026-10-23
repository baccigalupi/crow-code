/** @jsxImportSource @opentui/react */
import { describe, expect, it } from 'bun:test'
import { testRender } from '@opentui/react/test-utils'
import { RepoPathPrompt } from '../../../../../src/tui/install/views/steps/repo-path-prompt.tsx'
import { emptyText } from '../../../../../src/tui/input-text.ts'

describe('RepoPathPrompt', () => {
  it('when rendered, shows the default repo directory', async () => {
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <RepoPathPrompt repoDirectory={emptyText()} />,
      { width: 70, height: 3 },
    )

    await renderOnce()

    expect(captureCharFrame()).toContain(
      'What directory for the local repo crow setup: (.crow)',
    )
    renderer.destroy()
  })
})
