abstract class HeaderPathParser {
  protected header: string

  constructor(header: string) {
    this.header = header
  }

  abstract isMatch(): boolean
  abstract parse(): string
}

class QuotedPathParser extends HeaderPathParser {
  isMatch() {
    return this.header.endsWith('"')
  }

  parse() {
    return this.quotedNewPath()
      .slice(3, -1)
      .replace(/\\\\/g, '\\')
      .replace(/\\"/g, '"')
  }

  private quotedNewPath() {
    return this.header.slice(this.header.lastIndexOf(' "') + 1)
  }
}

class UnchangedPathParser extends HeaderPathParser {
  isMatch() {
    return this.header === 'a/' + this.parse() + ' b/' + this.parse()
  }

  parse() {
    return this.header.slice(2, 2 + (this.header.length - 5) / 2)
  }
}

class RenamedPathParser extends HeaderPathParser {
  isMatch() {
    return true
  }

  parse() {
    return this.header.slice(this.header.lastIndexOf(' b/') + 3)
  }
}

const quotedPathParser = (header: string) => new QuotedPathParser(header)

const unchangedPathParser = (header: string) => new UnchangedPathParser(header)

const renamedPathParser = (header: string) => new RenamedPathParser(header)

export const parseHeaderPath = (line: string) => {
  const header = line.slice('diff --git '.length)
  const parser = [
    quotedPathParser(header),
    unchangedPathParser(header),
    renamedPathParser(header),
  ].find((parser) => parser.isMatch())

  return parser!.parse()
}
