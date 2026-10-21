import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { render } from 'ink-testing-library'
import { EscalateWritePrompt } from '../../../../../src/tui/install/views/steps/escalate-write-prompt.tsx'
import { emptyBuffer, insertText } from '../../../../../src/tui/input-buffer.ts'

describe('escalate-write-prompt', () => {
  it('when the step is not escalateWrite, renders nothing', () => {
    const input = emptyBuffer()

    const { lastFrame } = render(
      <EscalateWritePrompt step='escalateRead' input={input} />,
    )

    expect(lastFrame()).toBe('')
  })

  it('when the step is escalateWrite, shows the default directories', () => {
    const input = emptyBuffer()

    const { lastFrame } = render(
      <EscalateWritePrompt step='escalateWrite' input={input} />,
    )

    expect(lastFrame()).toContain(
      'Escalate write directories: (./dev, ./agent)',
    )
  })

  it('when directories are typed, shows them instead of the default', () => {
    const input = insertText(emptyBuffer(), './scripts')

    const { lastFrame } = render(
      <EscalateWritePrompt step='escalateWrite' input={input} />,
    )

    expect(lastFrame()).toContain('Escalate write directories: ./scripts')
    expect(lastFrame()).not.toContain('./dev')
  })
})
