import { GitLogRecords } from './records.ts'

export class GitLogPatchParser {
  private options: string[]
  private output: string

  constructor(options: string[], output: string) {
    this.options = options
    this.output = output
  }

  isMatch() {
    return this.options.includes('-p')
  }

  parse() {
    const records = new GitLogRecords(this.output).records()
    const commits = records.map((record) => ({
      ...record.entry(),
      patch: record.body().join('\n'),
    }))
    return { commits }
  }
}
