/** @jsxImportSource @opentui/react */
import { describe, expect, it } from 'bun:test'
import { testRender } from '@opentui/react/test-utils'
import { EscalateReadPrompt } from '../../../../../src/opentui/install/views/steps/escalate-read-prompt.tsx'
import { emptyText, insertText } from '../../../../../src/opentui/input-text.ts'

describe('EscalateReadPrompt', () => {
  it('when nothing is typed, shows the none default', async () => {
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <EscalateReadPrompt escalateRead={emptyText()} />,
      { width: 70, height: 3 },
    )

    await renderOnce()

    expect(captureCharFrame()).toContain('Escalate read directories: (none)')
    renderer.destroy()
  })

  it('when directories are typed, shows them instead of the default', async () => {
    const escalateRead = insertText(emptyText(), '/docs, ~/notes')
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <EscalateReadPrompt escalateRead={escalateRead} />,
      { width: 70, height: 3 },
    )

    await renderOnce()

    expect(captureCharFrame()).toContain(
      'Escalate read directories: /docs, ~/notes',
    )
    expect(captureCharFrame()).not.toContain('(none)')
    renderer.destroy()
  })
})
