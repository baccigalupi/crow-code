import { describe, expect, it } from 'bun:test'
import { nameStatusFile } from '../../../../../../src/tools/git/read-only/git-passthrough/subcommands/name-status-file.ts'

describe('nameStatusFile', () => {
  it('when given a status line, returns its status and path', () => {
    const line = 'M\tallowed.txt'

    const file = nameStatusFile(line)

    expect(file).toEqual({ status: 'M', path: 'allowed.txt' })
  })

  it('when given a rename line, returns the new path', () => {
    const line = 'R100\told.txt\tnew.txt'

    const file = nameStatusFile(line)

    expect(file).toEqual({ status: 'R100', path: 'new.txt' })
  })
})
