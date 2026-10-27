import { GitLogRecords } from './records.ts'
import { parsedStat } from './stat.ts'

export class GitLogStatParser {
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
    const records = new GitLogRecords(this.output).records()
    const commits = records.map((record) => ({
      ...record.entry(),
      stat: parsedStat(record.body()),
    }))
    return { commits }
  }
}
