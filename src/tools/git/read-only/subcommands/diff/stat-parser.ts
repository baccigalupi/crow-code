import { parsedStat } from '../log/stat.ts'

export class GitDiffStatParser {
  private options: string[]
  private output: string

  constructor(options: string[], output: string) {
    this.options = options
    this.output = output
  }

  isMatch() {
    return this.options.includes('--stat')
  }

  parse() {
    const lines = this.output.split('\n').filter((line) => line !== '')
    return { stat: parsedStat(lines) }
  }
}
