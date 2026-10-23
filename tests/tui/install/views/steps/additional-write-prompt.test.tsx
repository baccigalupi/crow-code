/** @jsxImportSource @opentui/react */
import { describe, expect, it } from 'bun:test'
import { testRender } from '@opentui/react/test-utils'
import { AdditionalWritePrompt } from '../../../../../src/tui/install/views/steps/additional-write-prompt.tsx'
import { emptyText, insertText } from '../../../../../src/tui/input-text.ts'

describe('AdditionalWritePrompt', () => {
  it('when nothing is typed, shows the config default', async () => {
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <AdditionalWritePrompt additionalWrite={emptyText()} />,
      { width: 70, height: 3 },
    )

    await renderOnce()

    expect(captureCharFrame()).toContain('Additional write directories: []')
    renderer.destroy()
  })

  it('when directories are typed, shows them instead of the default', async () => {
    const additionalWrite = insertText(emptyText(), '/a, /b')
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <AdditionalWritePrompt additionalWrite={additionalWrite} />,
      { width: 70, height: 3 },
    )

    await renderOnce()

    expect(captureCharFrame()).toContain('Additional write directories: /a, /b')
    expect(captureCharFrame()).not.toContain('[]')
    renderer.destroy()
  })
})
