import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { gitDiffFiles } from '../../../../src/tools/git/diff/files.ts'
import { mockDenoCommand } from '../../../../tests/support/mock-deno-command.ts'

describe('gitDiffFiles', () => {
  it('when filter is null, returns all files in the current uncommitted diff', async () => {
    const files = await gitDiffFiles({
      denoCommand: mockDenoCommand({ stdout: 'src/a.ts\nsrc/b.ts\n' }),
    }).run()

    expect(files).toEqual(['src/a.ts', 'src/b.ts'])
  })
})
