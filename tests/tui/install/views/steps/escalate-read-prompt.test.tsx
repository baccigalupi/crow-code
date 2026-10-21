import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { render } from 'ink-testing-library'
import { EscalateReadPrompt } from '../../../../../src/tui/install/views/steps/escalate-read-prompt.tsx'
import { emptyBuffer, insertText } from '../../../../../src/tui/input-buffer.ts'

describe('escalate-read-prompt', () => {
  it('when the step is not escalateRead, renders nothing', () => {
    const input = emptyBuffer()

    const { lastFrame } = render(
      <EscalateReadPrompt step='envFile' input={input} />,
    )

    expect(lastFrame()).toBe('')
  })

  it('when the step is escalateRead, shows the empty default', () => {
    const input = emptyBuffer()

    const { lastFrame } = render(
      <EscalateReadPrompt step='escalateRead' input={input} />,
    )

    expect(lastFrame()).toContain('Escalate read directories: (none)')
  })

  it('when directories are typed, shows them instead of the default', () => {
    const input = insertText(emptyBuffer(), '/docs, ~/notes')

    const { lastFrame } = render(
      <EscalateReadPrompt step='escalateRead' input={input} />,
    )

    expect(lastFrame()).toContain('Escalate read directories: /docs, ~/notes')
    expect(lastFrame()).not.toContain('(none)')
  })
})
