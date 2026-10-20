import { resolve } from 'node:path'
import { OperationWithResult } from '../../../../operation.ts'
import type { ApplicationOperationArguments } from '../../../../types.ts'
import type { SearchMatch } from '../../../types.ts'
import { fileMatches } from './file-matches.ts'
import { filePaths } from './file-paths.ts'

type TaskArguments = {
  path: string
  pattern: string
  flags?: string
  context?: number
  filePattern?: string
}

type SortedMatchesArguments = ApplicationOperationArguments<TaskArguments>

export class SortedMatches
  extends OperationWithResult<TaskArguments, SearchMatch[]> {
  protected override logPrefix = 'Sorted matches: '
  private matches: SearchMatch[] = []

  async run() {
    await this.collect().catch((error: Error) => this.fail(error.message))
    return this
  }

  result() {
    return this.matches
  }

  private async collect() {
    const pattern = this.pattern()
    const paths = await this.paths()
    const matched = await paths.reduce(
      (previous, path) => this.append(previous, path, pattern),
      Promise.resolve([] as SearchMatch[]),
    )
    this.matches = matched.sort((left, right) => this.order(left, right))
  }

  private directory() {
    return resolve(
      this.applicationData.runtime.cwd,
      this.operationArguments.path,
    )
  }

  private pattern() {
    const { pattern, flags = '' } = this.operationArguments
    return new RegExp(pattern, flags)
  }

  private paths() {
    return filePaths({
      directory: this.directory(),
      ignoredDirectories: this.applicationData.readPathPermissions()
        .ignoredPaths(),
      filePattern: this.operationArguments.filePattern,
    }).all()
  }

  private async append(
    previous: Promise<SearchMatch[]>,
    path: string,
    pattern: RegExp,
  ) {
    const matches = await previous
    return [...matches, ...await this.fileMatches(path, pattern)]
  }

  private fileMatches(path: string, pattern: RegExp) {
    return fileMatches({
      directory: this.directory(),
      path,
      pattern,
      context: this.context(),
      filesystem: this.applicationData.filesystem,
    }).all()
  }

  private context() {
    const { context = 0 } = this.operationArguments
    return context
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
