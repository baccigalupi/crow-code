import type { GitLsTreeKind } from '../../../../../types.ts'

export class GitLsTreeParser {
  parse(stdout: string) {
    const lines = stdout.split('\n').filter((line) => line !== '')
    return { entries: lines.map((line) => this.parseLine(line)) }
  }

  private parseLine(line: string) {
    const [head, path] = line.split('\t')
    const [mode, kind, sha] = head.split(' ')
    return { path, mode, kind: kind as GitLsTreeKind, sha }
  }
}
