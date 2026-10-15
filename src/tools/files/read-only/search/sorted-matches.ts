import { resolve } from '@std/path'
import type { Runtime } from '../../../../application-data/runtime.ts'
import type { SearchMatch } from '../../../types.ts'
import { fileMatches } from './file-matches.ts'
import { filePaths } from './file-paths.ts'

type SortedMatchesArguments = {
  path: string
  pattern: string
  flags?: string
  context?: number
  ignoredDirectories?: string[]
  filePattern?: string
  runtime: Runtime
}

export class SortedMatches {
  private directory: string
  private pattern: RegExp
  private context: number
  private ignoredDirectories?: string[]
  private filePattern?: string
  private runtime: Runtime

  constructor(
    {
      path,
      pattern,
      flags = '',
      context = 0,
      ignoredDirectories,
      filePattern,
      runtime,
    }: SortedMatchesArguments,
  ) {
    this.directory = resolve(runtime.cwd(), path)
    this.pattern = new RegExp(pattern, flags)
    this.context = context
    this.ignoredDirectories = ignoredDirectories
    this.filePattern = filePattern
    this.runtime = runtime
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
    const { directory, ignoredDirectories, filePattern } = this
    return filePaths({ directory, ignoredDirectories, filePattern }).all()
  }

  private async append(previous: Promise<SearchMatch[]>, path: string) {
    const matches = await previous
    const { directory, pattern, context, runtime } = this
    return [
      ...matches,
      ...await fileMatches({ directory, path, pattern, context, runtime })
        .all(),
    ]
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
