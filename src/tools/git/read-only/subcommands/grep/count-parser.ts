import { GitGrepRevisionSplitter } from './revision-splitter.ts'

export class GitGrepCountParser {
  private options: string[]
  private output: string

  constructor(options: string[], output: string) {
    this.options = options
    this.output = output
  }

  isMatch() {
    return this.options.includes('-c')
  }

  parse() {
    const splitter = new GitGrepRevisionSplitter(this.options)
    const lines = this.output.split('\n').filter((line) => line !== '')
    return {
      counts: lines.map((line) =>
        splitter.split(line, (rest) => this.fields(rest)),
      ),
    }
  }

  private fields(line: string) {
    const split = line.lastIndexOf(':')
    return { path: line.slice(0, split), count: Number(line.slice(split + 1)) }
  }
}
