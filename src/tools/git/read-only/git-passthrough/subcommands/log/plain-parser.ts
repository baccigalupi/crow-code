import { GitLogRecords } from './records.ts'

export class GitLogPlainParser {
  private output: string

  constructor(output: string) {
    this.output = output
  }

  parse() {
    const records = new GitLogRecords(this.output).records()
    return { commits: records.map((record) => record.entry()) }
  }
}
