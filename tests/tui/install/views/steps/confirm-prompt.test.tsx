/** @jsxImportSource @opentui/react */
import { describe, expect, it } from 'bun:test'
import { testRender } from '@opentui/react/test-utils'
import { ConfirmPrompt } from '../../../../../src/tui/install/views/steps/confirm-prompt.tsx'

describe('ConfirmPrompt', () => {
  it('when confirmed, asks to complete setup with Yes selected', async () => {
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <ConfirmPrompt confirmation />,
      { width: 70, height: 4 },
    )

    await renderOnce()

    expect(captureCharFrame()).toContain('Complete setup?')
    expect(captureCharFrame()).toContain('▶ Yes')
    expect(captureCharFrame()).toContain('No')
    renderer.destroy()
  })

  it('when declined, selects No', async () => {
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <ConfirmPrompt confirmation={false} />,
      { width: 70, height: 4 },
    )

    await renderOnce()

    expect(captureCharFrame()).toContain('▶ No')
    expect(captureCharFrame()).not.toContain('▶ Yes')
    renderer.destroy()
  })
})
