import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { render } from 'ink-testing-library'
import { RepoPathPrompt } from '../../../../../src/tui/install/views/steps/repo-path-prompt.tsx'
import { emptyBuffer } from '../../../../../src/tui/input-buffer.ts'

describe('repo-path-prompt', () => {
  it('when rendered, shows the default repo directory', () => {
    const repoDirectory = emptyBuffer()

    const { lastFrame } = render(
      <RepoPathPrompt repoDirectory={repoDirectory} />,
    )

    expect(lastFrame()).toContain(
      'What directory for the local repo crow setup: (.crow)',
    )
  })
})
