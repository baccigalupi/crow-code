abstract class KeyParser {
  protected key: string

  constructor(key: string) {
    this.key = key
  }

  abstract isMatch(): boolean
  abstract parse(): string
}

class KebabCaseParser extends KeyParser {
  isMatch() {
    return /^[a-z0-9]+(-[a-z0-9]+)+$/.test(this.key)
  }

  parse() {
    return this.key.replaceAll('-', '_')
  }
}

class CamelCaseParser extends KeyParser {
  isMatch() {
    return /^[a-z][A-Za-z0-9]*$/.test(this.key)
  }

  parse() {
    return this.key.replace(/[A-Z]/g, (letter) => '_' + letter.toLowerCase())
  }
}

class NullParser extends KeyParser {
  isMatch() {
    return true
  }

  parse() {
    return this.key
  }
}

const kebabCaseParser = (key: string) => new KebabCaseParser(key)

const camelCaseParser = (key: string) => new CamelCaseParser(key)

const nullParser = (key: string) => new NullParser(key)

export const normalize = (key: string): string => {
  const parser = [
    kebabCaseParser(key),
    camelCaseParser(key),
    nullParser(key),
  ].find((parser) => parser.isMatch())

  return parser!.parse()
}
