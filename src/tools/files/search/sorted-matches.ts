import { resolve } from '@std/path'
import type { SearchMatch } from '../../types.ts'
import { fileMatches } from './file-matches.ts'
import { filePaths } from './file-paths.ts'

type SortedMatchesArguments = {
  path: string
  pattern: string
  flags?: string
  ignoredDirectories?: string[]
}

export class SortedMatches {
  private root: string
  private pattern: RegExp
  private ignoredDirectories?: string[]

  constructor(
    { path, pattern, flags = '', ignoredDirectories }: SortedMatchesArguments,
  ) {
    this.root = resolve(Deno.cwd(), path)
    this.pattern = new RegExp(pattern, flags)
    this.ignoredDirectories = ignoredDirectories
  }

  async all() {
    const paths = await this.paths()
    const matched = await paths.reduce(
      (previous, path) => this.append(previous, path),
      Promise.resolve([] as SearchMatch[]),
    )
    return matched.sort((left, right) => this.order(left, right))
  }

  private paths() {
    const { root, ignoredDirectories } = this
    return filePaths({ root, ignoredDirectories }).all()
  }

  private async append(previous: Promise<SearchMatch[]>, path: string) {
    const matches = await previous
    const { root, pattern } = this
    return [...matches, ...await fileMatches({ root, path, pattern }).all()]
  }

  private order(left: SearchMatch, right: SearchMatch) {
    if (left.path !== right.path) return left.path.localeCompare(right.path)

    return left.line - right.line
  }
}

export const sortedMatches = (
  sortedMatchesArguments: SortedMatchesArguments,
) => {
  return new SortedMatches(sortedMatchesArguments)
}
