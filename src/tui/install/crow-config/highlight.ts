type HighlightJsonArguments = {
  readonly json: string
  readonly key: string
}

// Splits `JSON.stringify(_, null, 2)` output around the line(s) of one
// top-level key. A key that is not found highlights nothing.
export class JsonHighlighter {
  private json: string
  private lines: string[]
  private key: string

  constructor({ json, key }: HighlightJsonArguments) {
    this.json = json
    this.lines = json.split('\n')
    this.key = key
  }

  split() {
    return this.splitAt(this.keyIndex())
  }

  private keyIndex() {
    return this.lines.findIndex((line) => line.startsWith(`  "${this.key}":`))
  }

  private unhighlighted() {
    return { before: this.json, highlighted: '', after: '' }
  }

  private splitAt(index: number) {
    if (index < 0) return this.unhighlighted()
    return this.splitAround(index)
  }

  private splitAround(index: number) {
    const end = this.blockEnd(index)
    return {
      before: [...this.lines.slice(0, index), '  '].join('\n'),
      highlighted: this.lines.slice(index, end + 1).join('\n').trimStart(),
      after: this.lines.slice(end + 1).map((line) => `\n${line}`).join(''),
    }
  }

  private blockEnd(index: number) {
    if (!this.opensBlock(index)) return index
    return this.closingIndex(index)
  }

  private opensBlock(index: number) {
    const line = this.lines[index]
    return line.endsWith('{') || line.endsWith('[')
  }

  private closingIndex(index: number) {
    const closing = this.lines.slice(index + 1).findIndex((line) =>
      line.startsWith('  }') || line.startsWith('  ]')
    )
    return index + 1 + closing
  }
}

export const highlightJson = (
  highlightJsonArguments: HighlightJsonArguments,
) => {
  return new JsonHighlighter(highlightJsonArguments).split()
}
