import { parseHeaderPath } from './header-path.ts'

export class TrackedChangeParser {
  private output: string

  constructor(output: string) {
    this.output = output
  }

  parse() {
    return this.chunks()
      .filter((chunk) => this.isFileDiff(chunk))
      .map((chunk) => this.parseChange(chunk))
  }

  private chunks() {
    return this.output.split(/^(?=diff --git )/m)
  }

  private isFileDiff(chunk: string) {
    return chunk.startsWith('diff --git ')
  }

  private parseChange(chunk: string) {
    return { path: parseHeaderPath(this.header(chunk)), diff: chunk }
  }

  private header(chunk: string) {
    const [header] = chunk.split('\n')
    return header
  }
}

export const trackedChangeParser = (output: string) => {
  return new TrackedChangeParser(output).parse()
}
