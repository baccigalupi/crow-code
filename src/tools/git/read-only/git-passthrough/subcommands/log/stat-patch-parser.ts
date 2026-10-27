import { trimmedLines } from './record.ts'
import { GitLogRecords } from './records.ts'
import { parsedStat } from './stat.ts'

export class GitLogStatPatchParser {
  private options: string[]
  private output: string

  constructor(options: string[], output: string) {
    this.options = options
    this.output = output
  }

  isMatch() {
    return this.options.includes('--stat') && this.options.includes('-p')
  }

  parse() {
    const records = new GitLogRecords(this.output).records()
    const commits = records.map((record) => ({
      ...record.entry(),
      ...this.statAndPatch(record.body()),
    }))
    return { commits }
  }

  private statAndPatch(lines: string[]) {
    const rest = lines.filter((line, index) => index > 0 || line !== '---')
    const blank = [...rest, ''].indexOf('')
    const patch = trimmedLines(rest.slice(blank + 1)).join('\n')
    return { stat: parsedStat(rest.slice(0, blank)), patch }
  }
}
