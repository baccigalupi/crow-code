import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { render } from 'ink-testing-library'
import {
  RepoPrompt,
  UserPrompt,
} from '../../../../src/tui/install/views/prompt.tsx'
import { emptyBuffer, insertText } from '../../../../src/tui/input-buffer.ts'

describe('prompts', () => {
  it('when the step is not repo, the repo prompt renders nothing', () => {
    const input = emptyBuffer()

    const { lastFrame } = render(<RepoPrompt step='user' input={input} />)

    expect(lastFrame()).toBe('')
  })

  it('when the step is not user, the user prompt renders nothing', () => {
    const input = emptyBuffer()

    const { lastFrame } = render(<UserPrompt step='repo' input={input} />)

    expect(lastFrame()).toBe('')
  })

  it('when the input is empty, shows the fallback directory', () => {
    const input = emptyBuffer()

    const { lastFrame } = render(<RepoPrompt step='repo' input={input} />)

    expect(lastFrame()).toContain('(.crow)')
  })

  it('when the input has text, hides the fallback directory', () => {
    const input = insertText(emptyBuffer(), './lib')

    const { lastFrame } = render(<RepoPrompt step='repo' input={input} />)

    expect(lastFrame()).not.toContain('(.crow)')
    expect(lastFrame()).toContain('./lib')
  })
})
