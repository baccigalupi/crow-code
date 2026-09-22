type HeredocOpener = { delimiter: string }

class ShellLexer {
  private command: string
  private index: number = 0
  private segments: string[] = []
  private current: string[] = []

  constructor(command: string) {
    this.command = command
  }

  lex(): string[] | null {
    while (this.index < this.command.length) {
      if (this.step() === null) return null
    }
    this.segments.push(this.current.join(''))
    return this.segments
  }

  private step(): null | void {
    const ch = this.command[this.index]
    if (ch === '\n' || ch === '|' || ch === ';' || ch === '&') {
      this.split()
      return
    }
    if (ch === "'") return this.singleQuote()
    if (ch === '"') return this.doubleQuote()
    const endChar = this.substitutionStart()
    if (endChar !== null) return this.substitution(endChar)
    if (ch === '<' && this.command[this.index + 1] === '<') {
      return this.heredoc()
    }
    if (ch === '<' || ch === '>') return null
    this.current.push(ch)
    this.index++
  }

  private split(): void {
    this.segments.push(this.current.join(''))
    this.current = []
    const ch = this.command[this.index]
    const next = this.command[this.index + 1] ?? ''
    this.index += (ch === '&' || ch === '|') && ch === next ? 2 : 1
  }

  private substitutionStart(): string | null {
    const ch = this.command[this.index]
    const next = this.command[this.index + 1] ?? ''
    if (ch === '$' && next === '(') {
      this.index += 2
      return ')'
    }
    if (ch === '`') {
      this.index++
      return '`'
    }
    return null
  }

  private singleQuote(): null | void {
    const end = this.command.indexOf("'", this.index + 1)
    if (end === -1) return null
    this.current.push(this.command.slice(this.index + 1, end))
    this.index = end + 1
  }

  private doubleQuote(): null | void {
    this.index++
    while (
      this.index < this.command.length && this.command[this.index] !== '"'
    ) {
      if (this.doubleQuoteStep() === null) return null
    }
    if (this.index >= this.command.length) return null
    this.index++
  }

  private doubleQuoteStep(): null | void {
    const ch = this.command[this.index]
    if (ch === '`') return null
    const endChar = this.substitutionStart()
    if (endChar !== null) return this.substitution(endChar)
    this.current.push(ch)
    this.index++
  }

  private substitution(endChar: string): null | void {
    if (this.skipSpaceAndCheckCat() === null) return null
    const body = this.readHeredocBody()
    if (body === null) return null
    if (this.command[this.index] !== endChar) return null
    this.current.push(body)
    this.index++
  }

  private skipSpaceAndCheckCat(): null | void {
    while (
      this.index < this.command.length && /\s/.test(this.command[this.index])
    ) this.index++
    if (!this.command.startsWith('cat', this.index)) return null
    this.index += 3
    const after = this.index
    if (
      after < this.command.length && /[A-Za-z0-9_]/.test(this.command[after])
    ) return null
    while (
      this.index < this.command.length && /\s/.test(this.command[this.index])
    ) this.index++
  }

  private heredoc(): null | void {
    if (this.readHeredocBody() === null) return null
  }

  private readHeredocBody(): string | null {
    const opener = this.heredocOpener()
    if (opener === null) return null
    const start = this.index
    const ends = this.heredocEnd(opener.delimiter)
    if (ends === null) return null
    const [bodyEnd, afterLine] = ends
    this.index = afterLine
    return this.command.slice(start, bodyEnd)
  }

  private heredocOpener(): HeredocOpener | null {
    this.index += 2
    const quote = this.command[this.index]
    if (quote !== "'" && quote !== '"') return this.unquotedOpener()
    const end = this.command.indexOf(quote, this.index + 1)
    if (end === -1) return null
    const delimiter = this.command.slice(this.index + 1, end)
    this.index = end + 1
    return { delimiter }
  }

  private unquotedOpener(): HeredocOpener | null {
    const start = this.index
    while (
      this.index < this.command.length &&
      !/\s|[|<>&;()]/.test(this.command[this.index])
    ) this.index++
    if (this.index === start) return null
    return { delimiter: this.command.slice(start, this.index) }
  }

  private heredocEnd(delimiter: string): [number, number] | null {
    const full = '\n' + delimiter + '\n'
    const found = this.command.indexOf(full, this.index)
    if (found !== -1) return [found, found + full.length]
    const tail = '\n' + delimiter
    const end = this.command.indexOf(tail, this.index)
    if (end === -1 || end + tail.length !== this.command.length) return null
    return [end, this.command.length]
  }
}

export const shellSegments = (command: string): string[] | null =>
  new ShellLexer(command).lex()
