import type { GitLogCommit, GitLogShape } from '../../../../../types.ts'
import { parsedStat } from './stat.ts'
import { GitLogRecords, logSeparator, trimmedLines } from './records.ts'

type GitLogCommitsArguments = {
  stdout: string
  shape: GitLogShape
}

export class GitLogCommits {
  private stdout: string
  private shape: GitLogShape

  constructor({ stdout, shape }: GitLogCommitsArguments) {
    this.stdout = stdout
    this.shape = shape
  }

  commits(): GitLogCommit[] {
    return new GitLogRecords(this.stdout)
      .records()
      .map(({ header, body }) => this.commit(header, body))
  }

  private commit(header: string, body: string[]) {
    return { ...this.entry(header), ...this.parsers()[this.shape](body) }
  }

  private entry(header: string) {
    const [sha, author, date, subject] = header.split(logSeparator)
    return { sha, author, date, subject }
  }

  private parsers() {
    return { ...this.fileParsers(), ...this.diffParsers() }
  }

  private fileParsers() {
    return {
      none: () => ({}),
      'name-only': (lines: string[]) => ({ files: this.pathFiles(lines) }),
      'name-status': (lines: string[]) => ({ files: this.statusFiles(lines) }),
    }
  }

  private diffParsers() {
    return {
      stat: (lines: string[]) => ({ stat: parsedStat(lines) }),
      patch: (lines: string[]) => ({ patch: lines.join('\n') }),
      'stat-patch': (lines: string[]) => this.statAndPatch(lines),
    }
  }

  private pathFiles(lines: string[]) {
    return lines.map((path) => ({ path }))
  }

  private statusFiles(lines: string[]) {
    return lines.map((line) => {
      const [status, path] = line.split('\t')
      return { status, path }
    })
  }

  private statAndPatch(lines: string[]) {
    const rest = lines.filter((line, index) => index > 0 || line !== '---')
    const blank = [...rest, ''].indexOf('')
    const patch = trimmedLines(rest.slice(blank + 1)).join('\n')
    return { stat: parsedStat(rest.slice(0, blank)), patch }
  }
}
