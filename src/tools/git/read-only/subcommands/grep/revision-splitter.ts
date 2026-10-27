export class GitGrepRevisionSplitter {
  private options: string[]

  constructor(options: string[]) {
    this.options = options
  }

  split<Fields extends object>(
    line: string,
    build: (rest: string) => Fields,
  ): Fields & { revision?: string } {
    if (this.revision(line) === '') {
      return build(line)
    }

    return this.withRevision(line, build)
  }

  private withRevision<Fields extends object>(
    line: string,
    build: (rest: string) => Fields,
  ) {
    const revision = this.revision(line)
    return { revision, ...build(line.slice(revision.length + 1)) }
  }

  private revision(line: string) {
    const names = this.options.filter((option, index) => {
      return !option.startsWith('-') && this.options[index - 1] !== '-e'
    })
    return names.find((name) => line.startsWith(`${name}:`)) || ''
  }
}
