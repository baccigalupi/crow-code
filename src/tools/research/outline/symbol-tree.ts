import type { Definition, OutlineSymbol } from '../language-parsers/types.ts'

export class SymbolTree {
  private definitions: Definition[]

  constructor(definitions: Definition[]) {
    this.definitions = definitions
  }

  roots() {
    return this.definitions
      .filter((definition) => this.parentOf(definition) === undefined)
      .map((definition) => this.nested(definition))
  }

  private nested(definition: Definition): OutlineSymbol {
    const children = this.definitions
      .filter((child) => this.parentOf(child) === definition)
      .map((child) => this.nested(child))

    return { ...definition.symbol, children }
  }

  private parentOf(definition: Definition) {
    return this.definitions
      .filter((outer) => this.contains(outer, definition))
      .at(-1)
  }

  private contains(outer: Definition, inner: Definition) {
    return (
      outer !== inner &&
      outer.node.startIndex <= inner.node.startIndex &&
      inner.node.endIndex <= outer.node.endIndex
    )
  }
}
