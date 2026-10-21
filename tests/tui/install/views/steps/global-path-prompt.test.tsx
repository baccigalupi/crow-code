import { describe, expect, it } from 'bun:test'
import { render } from 'ink-testing-library'
import { GlobalPathPrompt } from '../../../../../src/tui/install/views/steps/global-path-prompt.tsx'
import { emptyBuffer } from '../../../../../src/tui/input-buffer.ts'

describe('global-path-prompt', () => {
  it('when rendered, shows the default global directory', () => {
    const globalDirectory = emptyBuffer()

    const { lastFrame } = render(
      <GlobalPathPrompt globalDirectory={globalDirectory} />,
    )

    expect(lastFrame()).toContain('User crow directory: (~/.crow)')
  })
})
