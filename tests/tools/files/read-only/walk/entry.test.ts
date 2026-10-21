import type { Dirent } from 'node:fs'
import { describe, expect, it } from 'bun:test'
import { Entry } from '../../../../../src/tools/files/read-only/walk/entry.ts'

describe('Entry', () => {
  it('when asked for its path, joins the directory and the name', () => {
    const dirent = {
      name: 'alpha.txt',
      isFile: () => true,
      isDirectory: () => false,
      isSymbolicLink: () => false,
    } as Dirent
    const settings = {
      includeFiles: true,
      includeDirs: true,
      includeSymlinks: true,
      ignore: [],
    }
    const entry = new Entry('/root', dirent, settings)

    const path = entry.path()

    expect(path).toBe('/root/alpha.txt')
  })

  it('when the dirent is a directory, reports it is a directory', () => {
    const dirent = {
      name: 'nested',
      isFile: () => false,
      isDirectory: () => true,
      isSymbolicLink: () => false,
    } as Dirent
    const settings = {
      includeFiles: true,
      includeDirs: true,
      includeSymlinks: true,
      ignore: [],
    }
    const entry = new Entry('/root', dirent, settings)

    const isDirectory = entry.isDirectory()

    expect(isDirectory).toBe(true)
  })

  it('when the path matches an ignore pattern, is ignored', () => {
    const dirent = {
      name: 'nested',
      isFile: () => false,
      isDirectory: () => true,
      isSymbolicLink: () => false,
    } as Dirent
    const settings = {
      includeFiles: true,
      includeDirs: true,
      includeSymlinks: true,
      ignore: [/\/nested$/],
    }
    const entry = new Entry('/root', dirent, settings)

    const ignored = entry.ignored()

    expect(ignored).toBe(true)
  })

  it('when the path matches no ignore pattern, is not ignored', () => {
    const dirent = {
      name: 'alpha.txt',
      isFile: () => true,
      isDirectory: () => false,
      isSymbolicLink: () => false,
    } as Dirent
    const settings = {
      includeFiles: true,
      includeDirs: true,
      includeSymlinks: true,
      ignore: [/\/nested$/],
    }
    const entry = new Entry('/root', dirent, settings)

    const ignored = entry.ignored()

    expect(ignored).toBe(false)
  })

  describe('own', () => {
    it('when a file is included, returns it as a walk entry', () => {
      const dirent = {
        name: 'alpha.txt',
        isFile: () => true,
        isDirectory: () => false,
        isSymbolicLink: () => false,
      } as Dirent
      const settings = {
        includeFiles: true,
        includeDirs: false,
        includeSymlinks: false,
        ignore: [],
      }
      const entry = new Entry('/root', dirent, settings)

      const own = entry.own()

      expect(own).toEqual([
        {
          path: '/root/alpha.txt',
          name: 'alpha.txt',
          isFile: true,
          isDirectory: false,
          isSymlink: false,
        },
      ])
    })

    it('when files are excluded, returns nothing for a file', () => {
      const dirent = {
        name: 'alpha.txt',
        isFile: () => true,
        isDirectory: () => false,
        isSymbolicLink: () => false,
      } as Dirent
      const settings = {
        includeFiles: false,
        includeDirs: true,
        includeSymlinks: true,
        ignore: [],
      }
      const entry = new Entry('/root', dirent, settings)

      const own = entry.own()

      expect(own).toEqual([])
    })

    it('when directories are excluded, returns nothing for a directory', () => {
      const dirent = {
        name: 'nested',
        isFile: () => false,
        isDirectory: () => true,
        isSymbolicLink: () => false,
      } as Dirent
      const settings = {
        includeFiles: true,
        includeDirs: false,
        includeSymlinks: true,
        ignore: [],
      }
      const entry = new Entry('/root', dirent, settings)

      const own = entry.own()

      expect(own).toEqual([])
    })

    it('when symlinks are excluded, returns nothing for a symlink', () => {
      const dirent = {
        name: 'escape',
        isFile: () => false,
        isDirectory: () => false,
        isSymbolicLink: () => true,
      } as Dirent
      const settings = {
        includeFiles: true,
        includeDirs: true,
        includeSymlinks: false,
        ignore: [],
      }
      const entry = new Entry('/root', dirent, settings)

      const own = entry.own()

      expect(own).toEqual([])
    })

    it('when symlinks are included, returns the symlink as a walk entry', () => {
      const dirent = {
        name: 'escape',
        isFile: () => false,
        isDirectory: () => false,
        isSymbolicLink: () => true,
      } as Dirent
      const settings = {
        includeFiles: false,
        includeDirs: false,
        includeSymlinks: true,
        ignore: [],
      }
      const entry = new Entry('/root', dirent, settings)

      const own = entry.own()

      expect(own).toEqual([
        {
          path: '/root/escape',
          name: 'escape',
          isFile: false,
          isDirectory: false,
          isSymlink: true,
        },
      ])
    })
  })
})
