import { join } from '@std/path'
import type { SearchMatch } from '../../../types.ts'

type FileMatchesArguments = {
  directory: string
  path: string
  pattern: RegExp
  context?: number
}

export class FileMatches {
  private directory: string
  private path: string
  private pattern: RegExp
  private context: number

  constructor(
    { directory, path, pattern, context = 0 }: FileMatchesArguments,
  ) {
    this.directory = directory
    this.path = path
    this.pattern = pattern
    this.context = context
  }

  async all() {
    return this.lines(
      await Deno.readTextFile(join(this.directory, this.path)),
    )
  }

  private lines(text: string) {
    if (text.includes('\0')) return []

    const lines = text.split('\n')
    if (lines[lines.length - 1] === '') lines.pop()
    return lines.flatMap((line, index) => this.line(lines, line, index + 1))
  }

  private line(lines: string[], text: string, line: number) {
    if (text.search(this.pattern) === -1) return []

    const match: SearchMatch = { path: this.path, line, text }
    if (this.context > 0) {
      match.before = lines.slice(Math.max(0, line - 1 - this.context), line - 1)
      match.after = lines.slice(line, line + this.context)
    }
    return [match]
  }
}

export const fileMatches = (fileMatchesArguments: FileMatchesArguments) => {
  return new FileMatches(fileMatchesArguments)
}
