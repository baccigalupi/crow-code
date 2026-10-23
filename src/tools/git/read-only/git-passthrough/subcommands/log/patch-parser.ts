import { GitLogRecords } from './records.ts'

export class GitLogPatchParser {
  private options: string[]

  constructor(options: string[]) {
    this.options = options
  }

  isMatch() {
    return this.options.includes('-p')
  }

  parse(stdout: string) {
    const records = new GitLogRecords(stdout).records()
    const commits = records.map((record) => ({
      ...record.entry(),
      patch: record.body().join('\n'),
    }))
    return { commits }
  }
}
