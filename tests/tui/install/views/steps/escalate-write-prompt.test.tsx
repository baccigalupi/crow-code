import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { render } from 'ink-testing-library'
import { EscalateWritePrompt } from '../../../../../src/tui/install/views/steps/escalate-write-prompt.tsx'
import { emptyBuffer, insertText } from '../../../../../src/tui/input-buffer.ts'

describe('escalate-write-prompt', () => {
  it('when nothing is typed, shows the default directories', () => {
    const escalateWrite = emptyBuffer()

    const { lastFrame } = render(
      <EscalateWritePrompt escalateWrite={escalateWrite} />,
    )

    expect(lastFrame()).toContain(
      'Escalate write directories: (./dev, ./agent)',
    )
  })

  it('when directories are typed, shows them instead of the default', () => {
    const escalateWrite = insertText(emptyBuffer(), './scripts')

    const { lastFrame } = render(
      <EscalateWritePrompt escalateWrite={escalateWrite} />,
    )

    expect(lastFrame()).toContain('Escalate write directories: ./scripts')
    expect(lastFrame()).not.toContain('./dev')
  })
})
