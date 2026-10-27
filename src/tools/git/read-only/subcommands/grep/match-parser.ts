import type { GitGrepMatch } from '../../../../types.ts'
import { GitGrepRevisionSplitter } from './revision-splitter.ts'

export class GitGrepMatchParser {
  private options: string[]
  private output: string

  constructor(options: string[], output: string) {
    this.options = options
    this.output = output
  }

  isMatch() {
    return !this.options.includes('-c') && !this.options.includes('-l')
  }

  parse() {
    const splitter = new GitGrepRevisionSplitter(this.options)
    const lines = this.output.split('\n').filter((line) => line !== '')
    return {
      matches: lines.map((line) =>
        splitter.split(line, (rest) => this.fields(rest)),
      ),
    }
  }

  private fields(line: string): GitGrepMatch {
    if (this.options.includes('-n')) {
      return this.numbered(line)
    }

    return this.unnumbered(line)
  }

  private numbered(line: string) {
    const [path, lineNumber, ...rest] = line.split(':')
    return { path, line: Number(lineNumber), text: rest.join(':') }
  }

  private unnumbered(line: string) {
    const [path, ...rest] = line.split(':')
    return { path, text: rest.join(':') }
  }
}
