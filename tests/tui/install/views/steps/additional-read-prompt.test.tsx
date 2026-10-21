import { describe, expect, it } from 'bun:test'
import { render } from 'ink-testing-library'
import { AdditionalReadPrompt } from '../../../../../src/tui/install/views/steps/additional-read-prompt.tsx'
import { emptyBuffer, insertText } from '../../../../../src/tui/input-buffer.ts'

describe('additional-read-prompt', () => {
  it('when nothing is typed, shows the empty default', () => {
    const additionalRead = emptyBuffer()

    const { lastFrame } = render(
      <AdditionalReadPrompt additionalRead={additionalRead} />,
    )

    expect(lastFrame()).toContain('Additional read directories: (none)')
  })

  it('when directories are typed, shows them instead of the default', () => {
    const additionalRead = insertText(emptyBuffer(), '/docs, ~/notes')

    const { lastFrame } = render(
      <AdditionalReadPrompt additionalRead={additionalRead} />,
    )

    expect(lastFrame()).toContain('Additional read directories: /docs, ~/notes')
    expect(lastFrame()).not.toContain('(none)')
  })
})
