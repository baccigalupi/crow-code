import { describe, expect, it } from 'bun:test'
import { render } from 'ink-testing-library'
import { Prompt } from '../../../../src/tui/install/views/prompt.tsx'
import { emptyBuffer, insertText } from '../../../../src/tui/input-buffer.ts'

describe('prompt', () => {
  it('when the input is empty, shows the default value', () => {
    const input = emptyBuffer()

    const { lastFrame } = render(
      <Prompt label='Where' input={input} defaultValue='.crow' />,
    )

    expect(lastFrame()).toContain('Where: (.crow)')
  })

  it('when the input has text, hides the default value', () => {
    const input = insertText(emptyBuffer(), './lib')

    const { lastFrame } = render(
      <Prompt label='Where' input={input} defaultValue='.crow' />,
    )

    expect(lastFrame()).not.toContain('(.crow)')
    expect(lastFrame()).toContain('./lib')
  })
})
