import { nameStatusFile } from '../name-status-file.ts'

export class GitDiffNameStatusParser {
  private options: string[]
  private output: string

  constructor(options: string[], output: string) {
    this.options = options
    this.output = output
  }

  isMatch() {
    return this.options.includes('--name-status')
  }

  parse() {
    const lines = this.output.split('\n').filter((line) => line !== '')
    return { files: lines.map(nameStatusFile) }
  }
}
