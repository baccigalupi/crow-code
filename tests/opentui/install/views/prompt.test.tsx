/** @jsxImportSource @opentui/react */
import { describe, expect, it } from 'bun:test'
import { TextAttributes } from '@opentui/core'
import { testRender } from '@opentui/react/test-utils'
import { Prompt } from '../../../../src/opentui/install/views/prompt.tsx'
import { emptyText, insertText } from '../../../../src/opentui/input-text.ts'

describe('Prompt', () => {
  it('when the input is empty, shows the label and the default', async () => {
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <Prompt label="Where" input={emptyText()} defaultValue=".crow" />,
      { width: 40, height: 3 },
    )

    await renderOnce()

    expect(captureCharFrame()).toContain('Where: (.crow)')
    renderer.destroy()
  })

  it('when the input has text, shows the text and hides the default', async () => {
    const input = insertText(emptyText(), './lib')
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <Prompt label="Where" input={input} defaultValue=".crow" />,
      { width: 40, height: 3 },
    )

    await renderOnce()

    expect(captureCharFrame()).toContain('Where: ./lib')
    expect(captureCharFrame()).not.toContain('(.crow)')
    renderer.destroy()
  })

  it('when the cursor is inside the text, the character under it is inverse', async () => {
    const input = { text: 'abc', cursor: 1 }
    const { renderer, renderOnce, captureSpans } = await testRender(
      <Prompt label="Where" input={input} defaultValue=".crow" />,
      { width: 20, height: 1 },
    )

    await renderOnce()

    const { spans } = captureSpans().lines[0]
    expect(spans[1].text).toBe('b')
    expect(spans[1].attributes).toBe(TextAttributes.INVERSE)
    renderer.destroy()
  })
})
