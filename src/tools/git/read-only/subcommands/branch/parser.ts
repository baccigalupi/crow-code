import { GitBranchLine } from './line'

export class GitBranchParser {
  private output: string
  private showCurrent: boolean

  constructor(output: string, showCurrent: boolean) {
    this.output = output
    this.showCurrent = showCurrent
  }

  parse() {
    if (this.showCurrent) return { name: this.output.trim() }
    return {
      entries: this.lines().map((line) => new GitBranchLine(line).parse()),
    }
  }

  private lines() {
    return this.output.split('\n').filter((line) => line !== '')
  }
}
