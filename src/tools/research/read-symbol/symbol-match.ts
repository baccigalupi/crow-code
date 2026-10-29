import type { Definition } from '../language-parsers/types.ts'

export class SymbolMatch {
  private definitions: Definition[]

  constructor(definitions: Definition[]) {
    this.definitions = definitions
  }

  matches(name: string) {
    return this.definitions.filter((definition) => {
      const qualified = this.qualifiedName(definition)
      return qualified === name || qualified.endsWith(`.${name}`)
    })
  }

  private qualifiedName(definition: Definition) {
    return this.definitions
      .filter((outer) => this.contains(outer, definition))
      .map((outer) => outer.symbol.name)
      .concat(definition.symbol.name)
      .join('.')
  }

  private contains(outer: Definition, inner: Definition) {
    return (
      outer !== inner &&
      outer.node.startIndex <= inner.node.startIndex &&
      inner.node.endIndex <= outer.node.endIndex
    )
  }
}
