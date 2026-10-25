import type { GitStatusFile, GitStatusState } from '../../../../../types.ts'

const states: Record<string, GitStatusState> = {
  '.': 'unmodified',
  M: 'modified',
  T: 'typeChanged',
  A: 'added',
  D: 'deleted',
  R: 'renamed',
  C: 'copied',
  U: 'unmerged',
}

const fieldsBeforePath: Record<string, number> = { '1': 8, '2': 9, u: 10 }

export class GitStatusPorcelainParser {
  private options: string[]

  constructor(options: string[]) {
    this.options = options
  }

  isMatch() {
    return (
      this.options.includes('--porcelain=v2') && !this.options.includes('-s')
    )
  }

  parse(stdout: string) {
    const lines = stdout
      .split('\n')
      .filter((line) => line !== '' && !line.startsWith('#'))
    return { changes: lines.map((line) => this.parseLine(line)) }
  }

  private parseLine(line: string) {
    if (line.startsWith('? ')) return this.parseUntracked(line)
    return this.parseTracked(line)
  }

  private parseUntracked(line: string) {
    const untracked: GitStatusState = 'untracked'
    return { path: line.slice(2), index: untracked, worktree: untracked }
  }

  private parseTracked(line: string) {
    const fields = line.split(' ')
    const [path, oldPath] = this.paths(fields)
    const index = states[fields[1][0]]
    const worktree = states[fields[1][1]]
    return this.withOldPath({ path, index, worktree }, oldPath)
  }

  private withOldPath(entry: GitStatusFile, oldPath: string | undefined) {
    if (oldPath === undefined) return entry
    return { ...entry, oldPath }
  }

  private paths(fields: string[]) {
    return fields.slice(fieldsBeforePath[fields[0]]).join(' ').split('\t')
  }
}
