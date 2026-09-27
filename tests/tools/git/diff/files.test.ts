// Error conditions to cover:
// 1. git executable not found (command construction or output throws)
// 2. not inside a git repository (git exits non-zero)
// 3. git exits non-zero for any other reason (corrupt index, permissions, etc.)
// 4. git exists but cannot be executed (output returns success: false or throws)
// 5. no uncommitted diff — not an error; git exits 0 with empty stdout and returns []
//
// Porcelain-specific edge cases:
// 6. quoted paths (spaces/special characters) — parser must unquote
// 7. rename lines with "old -> new" — parser must keep the new path
// 8. untracked directories — git emits the directory path, not files inside

import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { assertSpyCall, spy } from '@std/testing/mock'
import pino from 'pino'
import { gitDiffFiles } from '../../../../src/tools/git/diff/files.ts'
import { loadTextFixture } from '../../../../tests/support/fixtures.ts'
import { mockDenoCommand } from '../../../../tests/support/mock-deno-command.ts'

describe('gitDiffFiles', () => {
  it('when filter is null, returns all files in the current uncommitted diff', async () => {
    const logger = pino({ enabled: false })
    const stdout = await loadTextFixture('tools/git/git-diff-files.txt')
    const gitDiff = gitDiffFiles({
      denoCommand: mockDenoCommand({ stdout }),
      logger,
    })
    await gitDiff.run()

    expect(gitDiff.success()).toBe(true)
    expect(gitDiff.result).toEqual([
      'src/tools/git/diff/files.ts',
      'tests/support/fixtures.ts',
      'tests/support/fixtures/model-info/catalog/providers/models-dev-api.json',
      'tests/support/fixtures/model-info/catalog/providers/nous-models.json',
      'tests/support/fixtures/model-info/catalog/providers/ollama-models.json',
      'tests/support/fixtures/model-info/catalog/providers/openrouter-models.json',
      'tests/tools/git/diff/files.test.ts',
      'tests/support/fixtures/tools/',
    ])
  })

  it('when git cannot be executed, returns an empty array', async () => {
    const logger = pino({ enabled: false })
    using loggerErrorSpy = spy(logger, 'error')
    const gitDiff = gitDiffFiles({
      denoCommand: mockDenoCommand({
        outputError: 'No such file or directory (os error 2): git',
      }),
      logger,
    })
    await gitDiff.run()

    expect(gitDiff.success()).toBe(false)
    expect(gitDiff.result).toEqual([])
    assertSpyCall(loggerErrorSpy, 0)
    expect(loggerErrorSpy.calls[0].args[0]).toBe(
      'Git error: No such file or directory (os error 2): git',
    )
  })
})
