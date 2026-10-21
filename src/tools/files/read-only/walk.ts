import type { Dirent } from 'node:fs'
import { readdir } from 'node:fs/promises'
import type { WalkEntry } from '../../types.ts'
import { Entry } from './walk/entry.ts'
import type { WalkSettings } from './walk/types.ts'

type WalkOptions = Partial<WalkSettings> & { maxDepth?: number }

class Walker {
  private root: string
  private maxDepth: number
  private settings: WalkSettings

  constructor(
    root: string,
    {
      maxDepth = Infinity,
      includeFiles = true,
      includeDirs = true,
      includeSymlinks = true,
      ignore = [],
    }: WalkOptions = {},
  ) {
    this.root = root
    this.maxDepth = maxDepth
    this.settings = { includeFiles, includeDirs, includeSymlinks, ignore }
  }

  run() {
    return this.entries(this.root, this.maxDepth)
  }

  private async entries(
    directory: string,
    depth: number,
  ): Promise<WalkEntry[]> {
    if (depth < 1) return []
    const dirents = await readdir(directory, { withFileTypes: true })
    const expanded = dirents
      .sort(this.byName)
      .map((dirent) => this.expandDirent(directory, dirent, depth))
    return (await Promise.all(expanded)).flat()
  }

  private expandDirent(directory: string, dirent: Dirent, depth: number) {
    return this.expand(new Entry(directory, dirent, this.settings), depth)
  }

  private byName(left: Dirent, right: Dirent) {
    return left.name.localeCompare(right.name)
  }

  private async expand(entry: Entry, depth: number) {
    if (entry.ignored()) return []

    const children = await this.children(entry, depth)
    return [...entry.own(), ...children]
  }

  private children(entry: Entry, depth: number) {
    if (entry.isDirectory()) return this.entries(entry.path(), depth - 1)

    return Promise.resolve([])
  }
}

export const walk = (root: string, options: WalkOptions = {}) => {
  return new Walker(root, options).run()
}
