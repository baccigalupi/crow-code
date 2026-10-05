import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { commitMessageMessages } from '../../../src/model-requests/commit-message/messages.ts'

describe('commitMessageMessages', () => {
  it('when given goal, changes and subjects, builds system and user messages', () => {
    const request = {
      goal: 'add login',
      changes: [{ path: 'src/a.ts', diff: 'diff --git a/src/a.ts b/src/a.ts' }],
      recentSubjects: ['Fix tests', 'Add REPL'],
    }

    const messages = commitMessageMessages(request)

    expect(messages[0].role).toBe('system')
    expect(messages[0].content).toContain('imperative mood')
    expect(messages[1].role).toBe('user')
    expect(messages[1].content).toContain('Goal:\nadd login')
    expect(messages[1].content).toContain(
      'Recent commit subjects:\n- Fix tests\n- Add REPL',
    )
    expect(messages[1].content).toContain('Changes:\n### src/a.ts')
    expect(messages[1].content).toContain('diff --git a/src/a.ts b/src/a.ts')
  })

  it('when there are no recent subjects, omits the subjects section', () => {
    const request = {
      goal: 'add login',
      changes: [{ path: 'src/a.ts', diff: 'diff --git a/src/a.ts b/src/a.ts' }],
      recentSubjects: [],
    }

    const messages = commitMessageMessages(request)

    expect(messages[1].content).not.toContain('Recent commit subjects:')
  })

  it('when there are no changes, keeps the goal and changes heading', () => {
    const request = {
      goal: 'add login',
      changes: [],
      recentSubjects: ['Fix tests'],
    }

    const messages = commitMessageMessages(request)

    expect(messages[1].content).toContain('add login')
    expect(messages[1].content).toContain('Changes:')
    expect(messages[1].content).not.toContain('###')
  })
})
