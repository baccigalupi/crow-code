export class GitBranchLine {
  private line: string

  constructor(line: string) {
    this.line = line
  }

  parse() {
    const current = this.line.startsWith('*')
    return { name: this.name(), current, ...this.details() }
  }

  private body() {
    return this.line.slice(2)
  }

  private name() {
    return this.firstWord(this.body())
  }

  private rest() {
    return this.body().slice(this.name().length).trim()
  }

  private details() {
    if (this.rest() === '') {
      return {}
    } else if (this.rest().startsWith('-> ')) {
      return { target: this.rest().slice(3) }
    } else {
      return this.commit()
    }
  }

  private commit() {
    const sha = this.firstWord(this.rest())
    return { sha, subject: this.rest().slice(sha.length).trim() }
  }

  private firstWord(text: string) {
    return text.replace(/\s.*$/, '')
  }
}
