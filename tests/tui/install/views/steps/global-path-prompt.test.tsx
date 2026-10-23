/** @jsxImportSource @opentui/react */
import { describe, expect, it } from 'bun:test'
import { testRender } from '@opentui/react/test-utils'
import { GlobalPathPrompt } from '../../../../../src/tui/install/views/steps/global-path-prompt.tsx'
import { emptyText } from '../../../../../src/tui/input-text.ts'

describe('GlobalPathPrompt', () => {
  it('when rendered, shows the default global directory', async () => {
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <GlobalPathPrompt globalDirectory={emptyText()} />,
      { width: 70, height: 3 },
    )

    await renderOnce()

    expect(captureCharFrame()).toContain('User crow directory: (~/.crow)')
    renderer.destroy()
  })
})
