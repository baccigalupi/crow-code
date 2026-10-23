import { parsedStat } from '../log/stat.ts'

export class GitDiffStatParser {
  private options: string[]

  constructor(options: string[]) {
    this.options = options
  }

  isMatch() {
    return this.options.includes('--stat')
  }

  parse(stdout: string) {
    const lines = stdout.split('\n').filter((line) => line !== '')
    return { stat: parsedStat(lines) }
  }
}
