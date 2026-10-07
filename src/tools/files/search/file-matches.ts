import { join } from '@std/path'

type FileMatchesArguments = {
  root: string
  path: string
  pattern: RegExp
}

export class FileMatches {
  private root: string
  private path: string
  private pattern: RegExp

  constructor({ root, path, pattern }: FileMatchesArguments) {
    this.root = root
    this.path = path
    this.pattern = pattern
  }

  async all() {
    return this.lines(await Deno.readTextFile(join(this.root, this.path)))
  }

  private lines(text: string) {
    if (text.includes('\0')) return []

    return text.split('\n').flatMap((line, index) => this.line(line, index + 1))
  }

  private line(text: string, line: number) {
    if (text.search(this.pattern) === -1) return []

    return [{ path: this.path, line, text }]
  }
}

export const fileMatches = (fileMatchesArguments: FileMatchesArguments) => {
  return new FileMatches(fileMatchesArguments)
}
