/** @jsxImportSource @opentui/react */
import { describe, expect, it } from 'bun:test'
import { testRender } from '@opentui/react/test-utils'
import { IgnorePrompt } from '../../../../../src/tui/install/views/steps/ignore-prompt.tsx'
import { emptyText, insertText } from '../../../../../src/tui/input-text.ts'

describe('IgnorePrompt', () => {
  it('when nothing is typed, shows the config default', async () => {
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <IgnorePrompt ignore={emptyText()} />,
      { width: 70, height: 3 },
    )

    await renderOnce()

    expect(captureCharFrame()).toContain('Ignored paths: []')
    renderer.destroy()
  })

  it('when paths are typed, shows them instead of the default', async () => {
    const ignore = insertText(emptyText(), '.env, secrets/')
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <IgnorePrompt ignore={ignore} />,
      { width: 70, height: 3 },
    )

    await renderOnce()

    expect(captureCharFrame()).toContain('Ignored paths: .env, secrets/')
    expect(captureCharFrame()).not.toContain('[]')
    renderer.destroy()
  })
})
