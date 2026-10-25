import type { GitRevListObject } from '../../../../../types.ts'

export class GitRevListObjectsParser {
  private options: string[]

  constructor(options: string[]) {
    this.options = options
  }

  isMatch() {
    return this.options.includes('--objects')
  }

  parse(stdout: string) {
    const lines = stdout.split('\n').filter((line) => line !== '')
    return { objects: lines.map((line) => this.parseLine(line)) }
  }

  private parseLine(line: string): GitRevListObject {
    const [sha, ...pathParts] = line.split(' ')
    const path = pathParts.join(' ')
    if (path === '') {
      return { sha }
    } else {
      return { sha, path }
    }
  }
}
