import { GitLogRecords } from './records.ts'

export class GitLogNameOnlyParser {
  private options: string[]
  private output: string

  constructor(options: string[], output: string) {
    this.options = options
    this.output = output
  }

  isMatch() {
    return this.options.includes('--name-only')
  }

  parse() {
    const records = new GitLogRecords(this.output).records()
    const commits = records.map((record) => ({
      ...record.entry(),
      files: record.body().map((path) => ({ path })),
    }))
    return { commits }
  }
}
