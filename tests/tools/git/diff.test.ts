import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { assertSpyCall, spy } from '@std/testing/mock'
import { gitDiff } from '../../../src/tools/git/diff.ts'
import { loadTextFixture } from '../../support/fixtures.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'
import { mockDenoCommand } from '../../support/mock-deno-command.ts'

describe('gitDiff', () => {
  it('when no filter is present, returns the full diff', async () => {
    const stdout = await loadTextFixture('tools/git/git-diff.diff')
    const commandSpy = spy()
    const applicationData = mockApplicationData({
      denoCommand: mockDenoCommand({ stdout, commandSpy }),
    })

    const diff = gitDiff({ applicationData })
    await diff.run()
    const fileDiffLines = diff.result().split('\n').filter((line) =>
      line.startsWith('diff --git')
    )

    assertSpyCall(commandSpy, 0, {
      args: ['git', { args: ['diff'] }],
    })
    expect(fileDiffLines).toEqual([
      'diff --git a/src/tools/git/diff/files.ts b/src/tools/git/diff/files.ts',
      'diff --git a/src/tools/git/diff/files/parser.ts b/src/tools/git/diff/files/parser.ts',
      'diff --git a/tests/tools/git/diff/files/parser.test.ts b/tests/tools/git/diff/files/parser.test.ts',
    ])
  })
})
