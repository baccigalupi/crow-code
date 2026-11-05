import { describe, expect, it } from 'bun:test'
import { RepoDirectoryStep } from '../../../../src/tui/install/steps/text/repo-directory-step.ts'

describe('TextStep', () => {
  it('when asked for its placeholder, is the default in parentheses', () => {
    const step = new RepoDirectoryStep()

    const placeholder = step.placeholder('.crow')

    expect(placeholder).toBe('(.crow)')
  })
})
