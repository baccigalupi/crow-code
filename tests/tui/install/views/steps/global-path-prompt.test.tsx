import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { render } from 'ink-testing-library'
import { GlobalPathPrompt } from '../../../../../src/tui/install/views/steps/global-path-prompt.tsx'
import { emptyBuffer } from '../../../../../src/tui/input-buffer.ts'

describe('global-path-prompt', () => {
  it('when the step is not crowGlobalDirectory, renders nothing', () => {
    const input = emptyBuffer()

    const { lastFrame } = render(<GlobalPathPrompt step='repo' input={input} />)

    expect(lastFrame()).toBe('')
  })

  it('when the step is crowGlobalDirectory, shows the default global directory', () => {
    const input = emptyBuffer()

    const { lastFrame } = render(
      <GlobalPathPrompt step='crowGlobalDirectory' input={input} />,
    )

    expect(lastFrame()).toContain('User crow directory: (~/.crow)')
  })
})
