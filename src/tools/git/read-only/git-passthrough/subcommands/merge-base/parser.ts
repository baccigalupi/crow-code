export class GitMergeBaseParser {
  private options: string[]

  constructor(options: string[]) {
    this.options = options
  }

  parse(stdout: string, exitCode: number) {
    if (this.options.includes('--is-ancestor')) {
      return { isAncestor: exitCode === 0 }
    } else if (this.isList()) {
      return { shas: stdout.split('\n').filter((line) => line !== '') }
    } else {
      return { sha: stdout.trim() }
    }
  }

  private isList() {
    return (
      this.options.includes('--all') || this.options.includes('--independent')
    )
  }
}
