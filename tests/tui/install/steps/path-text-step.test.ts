import { describe, expect, it } from 'bun:test'
import { RepoDirectoryStep } from '../../../../src/tui/install/steps/text/repo-directory-step.ts'

describe('PathTextStep', () => {
  it('when asked for its placeholder, is its default path in parentheses', () => {
    const step = new RepoDirectoryStep()

    const placeholder = step.placeholder()

    expect(placeholder).toBe('(.crow)')
  })
})
