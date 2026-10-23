import { GitLogRecords } from './records.ts'

export class GitLogPlainParser {
  parse(stdout: string) {
    const records = new GitLogRecords(stdout).records()
    return { commits: records.map((record) => record.entry()) }
  }
}
