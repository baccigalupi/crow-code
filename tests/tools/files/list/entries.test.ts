import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import type { WalkEntry } from '@std/fs'
import {
  DirectoryEntries,
  directoryEntries,
} from '../../../../src/tools/files/list/entries.ts'

describe('entries', () => {
  it('when the root is among the walked entries, drops it', () => {
    const root = '/root'
    const walked = [
      {
        path: '/root',
        name: 'root',
        isFile: false,
        isDirectory: true,
        isSymlink: false,
      },
      {
        path: '/root/a.txt',
        name: 'a.txt',
        isFile: true,
        isDirectory: false,
        isSymlink: false,
      },
    ]

    const entries = directoryEntries({ root, walked }).sorted()

    expect(entries).toEqual([{ path: 'a.txt', kind: 'file' }])
  })

  it('when entries are out of order, sorts them by relative path', () => {
    const root = '/root'
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

    const entries = directoryEntries({ root, walked }).sorted()

    expect(entries).toEqual([
      { path: 'a.txt', kind: 'file' },
      { path: 'nested', kind: 'directory' },
      { path: 'nested/b.md', kind: 'file' },
    ])
  })

  it('when an entry is a symlink, reports the symlink kind', () => {
    const root = '/root'
    const walked = [
      {
        path: '/root/link',
        name: 'link',
        isFile: false,
        isDirectory: false,
        isSymlink: true,
      },
    ]

    const entries = directoryEntries({ root, walked }).sorted()

    expect(entries).toEqual([{ path: 'link', kind: 'symlink' }])
  })

  it('when called through directoryEntries, returns a DirectoryEntries', () => {
    const root = '/root'
    const walked: WalkEntry[] = []

    const entries = directoryEntries({ root, walked })

    expect(entries).toBeInstanceOf(DirectoryEntries)
  })
})
