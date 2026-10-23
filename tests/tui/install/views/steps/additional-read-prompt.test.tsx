/** @jsxImportSource @opentui/react */
import { describe, expect, it } from 'bun:test'
import { testRender } from '@opentui/react/test-utils'
import { AdditionalReadPrompt } from '../../../../../src/tui/install/views/steps/additional-read-prompt.tsx'
import { emptyText, insertText } from '../../../../../src/tui/input-text.ts'

describe('AdditionalReadPrompt', () => {
  it('when nothing is typed, shows the none default', async () => {
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <AdditionalReadPrompt additionalRead={emptyText()} />,
      { width: 70, height: 3 },
    )

    await renderOnce()

    expect(captureCharFrame()).toContain('Additional read directories: (none)')
    renderer.destroy()
  })

  it('when directories are typed, shows them instead of the default', async () => {
    const additionalRead = insertText(emptyText(), '/docs, ~/notes')
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <AdditionalReadPrompt additionalRead={additionalRead} />,
      { width: 70, height: 3 },
    )

    await renderOnce()

    expect(captureCharFrame()).toContain(
      'Additional read directories: /docs, ~/notes',
    )
    expect(captureCharFrame()).not.toContain('(none)')
    renderer.destroy()
  })
})
