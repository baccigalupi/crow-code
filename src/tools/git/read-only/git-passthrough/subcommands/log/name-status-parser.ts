import { nameStatusFile } from '../name-status-file.ts'
import { GitLogRecords } from './records.ts'

export class GitLogNameStatusParser {
  private options: string[]

  constructor(options: string[]) {
    this.options = options
  }

  isMatch() {
    return this.options.includes('--name-status')
  }

  parse(stdout: string) {
    const records = new GitLogRecords(stdout).records()
    const commits = records.map((record) => ({
      ...record.entry(),
      files: record.body().map(nameStatusFile),
    }))
    return { commits }
  }
}
