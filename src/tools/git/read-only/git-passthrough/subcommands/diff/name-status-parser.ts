import { nameStatusFile } from '../name-status-file.ts'

export class GitDiffNameStatusParser {
  private options: string[]

  constructor(options: string[]) {
    this.options = options
  }

  isMatch() {
    return this.options.includes('--name-status')
  }

  parse(stdout: string) {
    const lines = stdout.split('\n').filter((line) => line !== '')
    return { files: lines.map(nameStatusFile) }
  }
}
