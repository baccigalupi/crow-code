export class GitMergeBaseParser {
  private options: string[]
  private output: string
  private exitCode: number

  constructor(options: string[], output: string, exitCode: number) {
    this.options = options
    this.output = output
    this.exitCode = exitCode
  }

  parse() {
    if (this.options.includes('--is-ancestor')) {
      return { isAncestor: this.exitCode === 0 }
    } else if (this.isList()) {
      return { shas: this.output.split('\n').filter((line) => line !== '') }
    } else {
      return { sha: this.output.trim() }
    }
  }

  private isList() {
    return (
      this.options.includes('--all') || this.options.includes('--independent')
    )
  }
}
