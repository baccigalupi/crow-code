import type { GitObjectKind } from '../../../../../types.ts'

export class GitCatFileTypeParser {
  private options: string[]
  private output: string

  constructor(options: string[], output: string) {
    this.options = options
    this.output = output
  }

  isMatch() {
    return this.options.includes('-t')
  }

  parse() {
    return { kind: this.output.trim() as GitObjectKind }
  }
}
