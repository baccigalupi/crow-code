class GoalParser {
  private raw: string
  private stripped = ''
  private parsed: unknown = []

  constructor(raw: string) {
    this.raw = raw
  }

  parse() {
    this.load()
    if (this.isStringArray()) {
      return this.parsed as string[]
    } else {
      return this.nullObject()
    }
  }

  private load() {
    this.stripped = this.strip()
    this.parsed = this.parseJson()
  }

  private strip() {
    return this.raw.trim()
      .replace(/^```[a-zA-Z]*\n?/, '')
      .replace(/```$/, '')
      .trim()
  }

  private parseJson() {
    try {
      return JSON.parse(this.stripped)
    } catch {
      return this.nullObject()
    }
  }

  private isStringArray() {
    return Array.isArray(this.parsed) && this.parsed.every(GoalParser.isString)
  }

  private static isString(value: unknown) {
    return typeof value === 'string'
  }

  private nullObject() {
    return []
  }
}

export const parse = (raw: string) => {
  return new GoalParser(raw).parse()
}
