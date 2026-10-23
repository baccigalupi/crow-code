import { GitLogRecords } from './records.ts'

export class GitLogNameOnlyParser {
  private options: string[]

  constructor(options: string[]) {
    this.options = options
  }

  isMatch() {
    return this.options.includes('--name-only')
  }

  parse(stdout: string) {
    const records = new GitLogRecords(stdout).records()
    const commits = records.map((record) => ({
      ...record.entry(),
      files: record.body().map((path) => ({ path })),
    }))
    return { commits }
  }
}
