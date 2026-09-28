import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { parseHeaderPath } from '../../../../src/tools/git/tracked-changes/header-path.ts'

describe('parseHeaderPath', () => {
  it('when both paths are the same, returns the path without b/', () => {
    const line = 'diff --git a/src/a.ts b/src/a.ts'

    const result = parseHeaderPath(line)

    expect(result).toEqual('src/a.ts')
  })

  it('when the file is renamed, returns the new path', () => {
    const line = 'diff --git a/old/name.ts b/new/name.ts'

    const result = parseHeaderPath(line)

    expect(result).toEqual('new/name.ts')
  })

  it('when paths are quoted, returns the unquoted new path', () => {
    const line = 'diff --git "a/with space.txt" "b/with space.txt"'

    const result = parseHeaderPath(line)

    expect(result).toEqual('with space.txt')
  })

  it('when a quoted path contains escaped quotes, unescapes them', () => {
    const line = 'diff --git "a/x\\"y.txt" "b/x\\"y.txt"'

    const result = parseHeaderPath(line)

    expect(result).toEqual('x"y.txt')
  })

  it('when an unquoted path contains " b/", returns the full path', () => {
    const line = 'diff --git a/dir b/file.ts b/dir b/file.ts'

    const result = parseHeaderPath(line)

    expect(result).toEqual('dir b/file.ts')
  })
})
