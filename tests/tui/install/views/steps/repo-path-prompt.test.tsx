import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { render } from 'ink-testing-library'
import { RepoPathPrompt } from '../../../../../src/tui/install/views/steps/repo-path-prompt.tsx'
import { emptyBuffer } from '../../../../../src/tui/input-buffer.ts'

describe('repo-path-prompt', () => {
  it('when the step is not repo, renders nothing', () => {
    const input = emptyBuffer()

    const { lastFrame } = render(
      <RepoPathPrompt step='crowGlobalDirectory' input={input} />,
    )

    expect(lastFrame()).toBe('')
  })

  it('when the step is repo, shows the default repo directory', () => {
    const input = emptyBuffer()

    const { lastFrame } = render(<RepoPathPrompt step='repo' input={input} />)

    expect(lastFrame()).toContain(
      'What directory for the local repo crow setup: (.crow)',
    )
  })
})
