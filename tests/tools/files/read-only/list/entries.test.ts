import { describe, expect, it } from 'bun:test'
import {
  DirectoryEntries,
  directoryEntries,
} from '../../../../../src/tools/files/read-only/list/entries.ts'
import type { WalkEntry } from '../../../../../src/tools/types.ts'

describe('entries', () => {
  it('when entries are out of order, sorts them by relative path', () => {
    const directory = '/root'
    const walked = [
      {
        path: '/root/nested/b.md',
        name: 'b.md',
        isFile: true,
        isDirectory: false,
        isSymlink: false,
      },
      {
        path: '/root/a.txt',
        name: 'a.txt',
        isFile: true,
        isDirectory: false,
        isSymlink: false,
      },
      {
        path: '/root/nested',
        name: 'nested',
        isFile: false,
        isDirectory: true,
        isSymlink: false,
      },
    ]

    const entries = directoryEntries({ directory, walked }).sorted()

    expect(entries).toEqual([
      { path: 'a.txt', kind: 'file' },
      { path: 'nested', kind: 'directory' },
      { path: 'nested/b.md', kind: 'file' },
    ])
  })

  it('when an entry is a symlink, reports the symlink kind', () => {
    const directory = '/root'
    const walked = [
      {
        path: '/root/link',
        name: 'link',
        isFile: false,
        isDirectory: false,
        isSymlink: true,
      },
    ]

    const entries = directoryEntries({ directory, walked }).sorted()

    expect(entries).toEqual([{ path: 'link', kind: 'symlink' }])
  })

  it('when called through directoryEntries, returns a DirectoryEntries', () => {
    const directory = '/root'
    const walked: WalkEntry[] = []

    const entries = directoryEntries({ directory, walked })

    expect(entries).toBeInstanceOf(DirectoryEntries)
  })
})
