import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { requestMessages } from '../../../src/tools/git-commit/messages.ts'

describe('requestMessages', () => {
  it('when messages are requested, asks for one concise summary without prose', () => {
    const messages = requestMessages('diff --git a/file.ts b/file.ts', '')

    expect(messages[0].content).toContain('one concise commit-message summary')
    expect(messages[0].content).toContain('no surrounding prose')
  })

  it('when a goal is available, includes the diff and goal', () => {
    const messages = requestMessages(
      'diff --git a/file.ts b/file.ts',
      'add CLI',
    )

    expect(messages[1].content).toContain('diff --git a/file.ts b/file.ts')
    expect(messages[1].content).toContain('Goal:\nadd CLI')
  })

  it('when a goal is unavailable, includes the diff without a goal section', () => {
    const messages = requestMessages('diff --git a/file.ts b/file.ts', '')

    expect(messages[1].content).toContain('diff --git a/file.ts b/file.ts')
    expect(messages[1].content).not.toContain('Goal:')
  })
})
