import type { GitRevListObject } from '../../../../types.ts'

export class GitRevListObjectsParser {
  private options: string[]
  private output: string

  constructor(options: string[], output: string) {
    this.options = options
    this.output = output
  }

  isMatch() {
    return this.options.includes('--objects')
  }

  parse() {
    const lines = this.output.split('\n').filter((line) => line !== '')
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
