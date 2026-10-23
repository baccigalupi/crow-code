/** @jsxImportSource @opentui/react */
import { describe, expect, it } from 'bun:test'
import { testRender } from '@opentui/react/test-utils'
import { EscalateWritePrompt } from '../../../../../src/tui/install/views/steps/escalate-write-prompt.tsx'
import { emptyText, insertText } from '../../../../../src/tui/input-text.ts'

describe('EscalateWritePrompt', () => {
  it('when nothing is typed, shows the default write directories', async () => {
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <EscalateWritePrompt escalateWrite={emptyText()} />,
      { width: 70, height: 3 },
    )

    await renderOnce()

    expect(captureCharFrame()).toContain(
      'Escalate write directories: (./dev, ./agent)',
    )
    renderer.destroy()
  })

  it('when directories are typed, shows them instead of the default', async () => {
    const escalateWrite = insertText(emptyText(), './scripts')
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <EscalateWritePrompt escalateWrite={escalateWrite} />,
      { width: 70, height: 3 },
    )

    await renderOnce()

    expect(captureCharFrame()).toContain(
      'Escalate write directories: ./scripts',
    )
    expect(captureCharFrame()).not.toContain('./dev')
    renderer.destroy()
  })
})
