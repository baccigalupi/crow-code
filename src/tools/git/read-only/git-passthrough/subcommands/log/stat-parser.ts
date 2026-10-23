import { GitLogRecords } from './records.ts'
import { parsedStat } from './stat.ts'

export class GitLogStatParser {
  private options: string[]

  constructor(options: string[]) {
    this.options = options
  }

  isMatch() {
    return this.options.includes('--stat')
  }

  parse(stdout: string) {
    const records = new GitLogRecords(stdout).records()
    const commits = records.map((record) => ({
      ...record.entry(),
      stat: parsedStat(record.body()),
    }))
    return { commits }
  }
}
